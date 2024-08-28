import bs58 from 'bs58';
import { Connection, Keypair } from '@solana/web3.js';
import SecretManagerService from '@services/aws/secret_manager';
import MyError from '@exceptions/my_error.exception';
import { EHttpStatus } from '@enums/http.enum';
import { ERROR_CODE } from '@constants/error.constant';
import SolanaService from '@services/solana';
import LoggerUtil from '@utils/logger.util';
import { IOT_DEVICE_TYPE, IOT_PROJECT_TYPE } from '@constants/iot.constant';
import HistoryService from '@services/history';
import { EDeviceCreditActionType, EIotDeviceType } from '@enums/device.enum';
import { EMintScheduleType } from '@enums/minting.enum';
import ConfigService from '@services/config';
import Dcarbon from '@services/dcarbon';
import { IIotSignatureInput } from '@interfaces/minting';
import { ILambdaSqsTriggerEvent } from '@interfaces/commons';
import Sqs from '@services/aws/sqs';
import { ISQSProjectMintingInput } from '@services/minting/minting.interface';
import CommonUtil from '@utils/common.util';
import { MintingScheduleEntity } from '@entities/minting_schedule.entity';
import { IotProject } from '@services/dcarbon/dcarbon.interface';
import loggerUtil from '@utils/logger.util';
import Notification from '@services/notification';

class MintingService {
  private MINT_LOOKUP_TABLE = process.env.COMMON_MINT_LOOKUP_TABLE;

  private MINTER_KEYPAIR: Keypair;

  private MINTING_BATCH_SIZE = 4;

  async triggerScheduleMinting(requestId: string, records: ILambdaSqsTriggerEvent[]): Promise<void> {
    const record = records[0];
    const body: { minting_schedule: EMintScheduleType } = JSON.parse(record.body);
    const scheduleType = body?.minting_schedule;
    try {
      if (body?.minting_schedule) {
        const minter = await ConfigService.getMintingSigner();
        const minterBalance = await SolanaService.getBalanceOfWallet(minter.aws_sm_key);
        if (!minterBalance || minterBalance < 0.5) {
          await Notification.minterBalanceLow(requestId, scheduleType, minterBalance);
          LoggerUtil.error(ERROR_CODE.CONFIG.MINTER_BALANCE_TO_LOW.msg);
          return;
        }
        LoggerUtil.process(`Trigger minting [${scheduleType.toUpperCase()}]`);
        const schedules = await ConfigService.getMintingSchedule({ schedule_type: scheduleType });
        if (schedules.length > 0) {
          LoggerUtil.info(`Project minting: ${JSON.stringify(schedules.map((info) => info.project_id))}`);
          const errors: string[] = [];
          const success: string[] = [];
          const splitArr = CommonUtil.splitArray<MintingScheduleEntity>(schedules, 20);
          const queue = process.env.AWS_SQS_LAMBDA_PROJECT_MINTING_URL as string;
          const msgGroupId = `${process.env.STAGE}_PROJECT_MINTING`;
          for (let i = 0; i < splitArr.length; i++) {
            await Promise.all(
              splitArr[i].map(async (schedule) => {
                try {
                  await Sqs.createSQS<ISQSProjectMintingInput>(
                    {
                      queue_url: queue,
                      message_group_id: msgGroupId,
                      message_deduplication_id: schedule.project_id,
                      message_body: {
                        project_id: schedule.project_id,
                      },
                    },
                    true,
                  );
                  success.push(schedule.project_id);
                } catch (e) {
                  errors.push(schedule.project_id);
                }
              }),
            );
          }
          if (errors.length > 0) {
            LoggerUtil.error(`Cannot create minting schedule for projects: ${JSON.stringify(errors)}`);
            await Notification.scheduleProjectMintingError(requestId, scheduleType, errors);
          }
          if (success.length > 0) {
            LoggerUtil.success(`Schedule projects success [${JSON.stringify(success)}]`);
            await Notification.scheduleProjectMintingSuccess(requestId, scheduleType, success);
          }
        } else {
          await Notification.warningMinting(requestId, `[${scheduleType.toUpperCase()}] NO PROJECTS SCHEDULED`);
        }
        LoggerUtil.success(`Trigger minting [${scheduleType.toUpperCase()}]`);
      }
    } catch (e) {
      LoggerUtil.error(e.stack);
      await Notification.error(
        requestId,
        `TRIGGER [${scheduleType?.toUpperCase()}] MINTING ERROR: 
      
Error: ${e.message}`,
      );
    }
  }

  async triggerProjectMinting(requestId: string, records: ILambdaSqsTriggerEvent[]): Promise<void> {
    const record = records[0];
    const body: { project_id: string } = JSON.parse(record.body);
    if (body?.project_id) {
      try {
        await this.projectMinting(requestId, body.project_id);
      } catch (e) {
        LoggerUtil.error(e.stack);
        await Notification.error(
          requestId,
          `MINTING - PROJECT MINTING ERROR:
        
Project ID: ${body?.project_id}
Error: ${e.message}`,
        );
      }
    }
  }

  async projectMinting(requestId: string, projectId: string): Promise<void> {
    LoggerUtil.process(`Minting project [${projectId}]`);
    const minter = await ConfigService.getMintingSigner();
    let minterKeypair = this.MINTER_KEYPAIR;
    if (!minterKeypair) {
      minterKeypair = await this.getSignerKeypair(minter.aws_sm_key);
      this.MINTER_KEYPAIR = minterKeypair;
    }
    const [devicesRegistered, { data: dcarbonDevices }, { data: project }] = await Promise.all([
      SolanaService.getDevicesRegisteredOfProject(projectId),
      Dcarbon.getDevices({
        projectId: projectId,
        status: -1,
        type: EIotDeviceType.ALL,
        limit: 99999,
      }),
      Dcarbon.projectDetail(projectId),
    ]);
    const mintingDevices: string[] = [];
    devicesRegistered.forEach((id) => {
      const match = dcarbonDevices.find((device) => device.id === String(id));
      if (match) mintingDevices.push(String(id));
    });
    const splitMintingDevices = CommonUtil.splitArray<string>(mintingDevices, this.MINTING_BATCH_SIZE);
    const errorDevices = [];
    const successDevices = [];
    const errorSyncTxs: string[] = [];
    const invalidNonceDevices: string[] = [];
    let connection: Connection;
    for (let i = 0; i < splitMintingDevices.length; i++) {
      await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-loop-func
        splitMintingDevices[i].map(async (device) => {
          try {
            const mintResult = await this.deviceMinting(minterKeypair, device, project);
            successDevices.push(device);
            if (mintResult?.invalidNonce) invalidNonceDevices.push(device);
            if (mintResult?.errorSyncTx) errorSyncTxs.push(mintResult.errorSyncTx);
            if (!connection && mintResult?.connection) connection = mintResult.connection;
          } catch (e) {
            errorDevices.push(device);
            loggerUtil.error(`Minting device [${device}] of project [${projectId}] has error: ${e.stack}`);
          }
        }),
      );
    }
    if (invalidNonceDevices.length > 0) {
      await Notification.warningMinting(
        requestId,
        `MINTING - INVALID NONCE:
        
Project ID: ${projectId}
Device IDs: ${JSON.stringify(invalidNonceDevices)}`,
      );
    }
    if (errorSyncTxs.length > 0) {
      const errorSyncTxs2rd: string[] = [];
      await Promise.all(
        errorDevices.map(async (tx) => {
          try {
            await this.syncMintTransaction(connection, tx, undefined, true);
          } catch (e) {
            errorSyncTxs2rd.push(tx);
            LoggerUtil.error(`[RETRY] Cannot sync 2rd minting tx [${tx}]: ${e.stack}`);
          }
        }),
      );
      if (errorSyncTxs2rd.length > 0) {
        LoggerUtil.error(`[FINISHED] Cannot sync 2rd minting txs [${JSON.stringify(errorSyncTxs2rd)}]`);
        await Notification.error(
          requestId,
          `MINTING - CAN NOT SYNC MINT TRANSACTION:
        
Project ID: ${projectId}
Transactions: ${JSON.stringify(errorSyncTxs2rd)}`,
        );
      }
    }
    if (errorDevices.length > 0) {
      LoggerUtil.error(
        `[FINISHED] Minting devices ${JSON.stringify(errorDevices)} of project [${projectId}] has error`,
      );
      await Notification.error(
        requestId,
        `MINTING - CAN SEND MINT TRANSACTION:
        
Project ID: ${projectId}
Device IDs: ${JSON.stringify(errorDevices)}`,
      );
    }
    LoggerUtil.success(`Minting project [${projectId}]`);
  }

  async deviceMinting(
    minter: Keypair,
    deviceId: string,
    project: IotProject,
  ): Promise<{
    connection?: Connection;
    errorSyncTx?: string;
    invalidNonce?: boolean;
  }> {
    LoggerUtil.process(`Minting device [${deviceId}] of project ${project.id}`);
    let errorSyncTx: string | undefined;
    const [deviceSetting, contractConfig, { data: sign }] = await Promise.all([
      SolanaService.getDeviceSetting(project.id, deviceId),
      SolanaService.contractSetting(),
      Dcarbon.latestDeviceSign(deviceId),
    ]);
    const signatureInput: IIotSignatureInput = {
      signed: sign.signed,
      nonce: Number(sign.nonce),
      iot: sign.iot,
      amount: sign.amount,
    };
    if (!deviceSetting) {
      LoggerUtil.warning(
        `Device [${deviceId}] of project [${project.id}] ${ERROR_CODE.MINTING.DEVICE_NOT_REGISTER.msg}`,
      );
      return;
    } else if (!deviceSetting.is_active || !deviceSetting.device_id) {
      LoggerUtil.warning(`Device [${deviceId}] of project [${project.id}] inactive`);
      return;
    } else if (deviceSetting.nonce + 1 !== signatureInput.nonce) {
      LoggerUtil.warning(`Device [${deviceId}] of project [${project.id}] invalid nonce`);
      return {
        invalidNonce: true,
      };
    } else {
      const deviceType = IOT_DEVICE_TYPE.find((type) => type.id === deviceSetting.device_type);
      const projectType = IOT_PROJECT_TYPE.find((info) => info.id === project.type);
      const mintResult = await SolanaService.mintDeviceSNFT(
        this.MINT_LOOKUP_TABLE,
        minter,
        {
          name: `DCO2 ${deviceId}-${signatureInput.nonce}`,
          symbol: `DCO2`,
          image: `${process.env.ENDPOINT_IPFS_NFT_IMAGE}`,
          attributes: [
            {
              trait_type: 'Project ID',
              value: project.id,
            },
            {
              trait_type: 'Project Name',
              value: project.descs && project.descs.length > 0 ? project.descs[0].name : `Project ${project.id}`,
            },
            {
              trait_type: 'Project Model',
              value: projectType ? projectType.name : IOT_PROJECT_TYPE[0].name,
            },
            {
              trait_type: 'Device ID',
              value: deviceId,
            },
            {
              trait_type: 'Device Type',
              value: deviceType ? deviceType.name : IOT_DEVICE_TYPE[1].name,
            },
          ],
        },
        signatureInput,
        project.id,
        deviceId,
        deviceSetting.owner,
        contractConfig.vault,
      );
      if (mintResult) {
        try {
          await this.syncMintTransaction(mintResult.connection, mintResult.signature, mintResult.txTime, true);
        } catch (e) {
          errorSyncTx = mintResult.signature;
          LoggerUtil.error(`Cannot sync minting tx [${mintResult.signature}]: ${e.stack}`);
        }
        LoggerUtil.success(`Minting device ${deviceId} of project ${project.id}`);
        return {
          errorSyncTx,
          connection: mintResult.connection,
        };
      }
    }
  }

  async minting(projectId: string, deviceId: string, amount: number, nonce: number, mint_time: number): Promise<any> {
    const [{ data: project }, deviceSetting, contractConfig] = await Promise.all([
      Dcarbon.projectDetail(projectId),
      SolanaService.getDeviceSetting(projectId, deviceId),
      SolanaService.contractSetting(),
    ]);
    if (!deviceSetting.is_active || !deviceSetting.device_id) {
      LoggerUtil.info(`Device [${deviceId}] of project [${projectId}] inactive`);
    } else if (deviceSetting.nonce + 1 !== nonce) {
      throw new MyError(
        EHttpStatus.BadRequest,
        ERROR_CODE.MINTING.DEVICE_NONCE_INVALID.code,
        ERROR_CODE.MINTING.DEVICE_NONCE_INVALID.msg,
      );
    } else {
      const singer = await this.getSignerKeypair(deviceSetting.minter.toString());
      const deviceType = IOT_DEVICE_TYPE.find((type) => type.id === deviceSetting.device_type);
      const projectType = IOT_PROJECT_TYPE.find((info) => info.id === project.type);
      const { signature, connection } = await SolanaService.mintSNFT(
        this.MINT_LOOKUP_TABLE,
        singer,
        {
          name: `DCO2 ${deviceId}-${nonce}`,
          symbol: `DCO2`,
          image: `${process.env.ENDPOINT_IPFS_NFT_IMAGE}`,
          attributes: [
            {
              trait_type: 'Project ID',
              value: projectId,
            },
            {
              trait_type: 'Project Name',
              value: project.descs && project.descs.length > 0 ? project.descs[0].name : `Project ${projectId}`,
            },
            {
              trait_type: 'Project Model',
              value: projectType ? projectType.name : IOT_PROJECT_TYPE[0].name,
            },
            {
              trait_type: 'Device ID',
              value: deviceId,
            },
            {
              trait_type: 'Device Type',
              value: deviceType ? deviceType.name : IOT_DEVICE_TYPE[1].name,
            },
          ],
        },
        {
          iot: '0x4d0155c687739bce9440ffb8aba911b00b21ea56',
          amount: '0x00',
          nonce: 1,
          signed: 'skN4F+Ebh3ShbfySpMCy+zfyrz8VwYUzdDo6RD+Ed4I8ItawaFZ2MYGSRd/6yXALOeOqsNIzsiOBufCI3shh4xw=',
        },
        projectId,
        deviceId,
        amount,
        nonce,
        deviceSetting.owner,
        contractConfig.vault,
      );
      await this.syncMintTransaction(connection, signature, mint_time, false);
    }
    return deviceSetting;
  }

  async getSignerKeypair(signerPublicKey: string): Promise<Keypair> {
    const secret = await SecretManagerService.getSecret(`dcarbon/${process.env.STAGE}/mint_signer/${signerPublicKey}`);
    if (!secret)
      throw new MyError(
        EHttpStatus.BadRequest,
        ERROR_CODE.MINTING.MINTER_KEYPAIR_NOT_FOUND.code,
        ERROR_CODE.MINTING.MINTER_KEYPAIR_NOT_FOUND.msg,
      );
    return Keypair.fromSecretKey(bs58.decode(secret));
  }

  async syncMintTransaction(
    connection: Connection,
    signature: string,
    mintTime?: number,
    throwError = true,
  ): Promise<any> {
    try {
      const data = await connection.getParsedTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      });
      if (!data) return;
      const mintInfo = data?.meta?.logMessages?.find((log) => log.indexOf('Program log: mintinfo_') !== -1);
      const mint =
        data?.meta?.postTokenBalances && data?.meta?.postTokenBalances.length > 0
          ? data?.meta?.postTokenBalances[0].mint
          : undefined;
      if (mintInfo && mint) {
        const arr = mintInfo.replace('Program log: mintinfo_', '').split('_');
        await HistoryService.createDeviceTxHistory({
          mint,
          signature,
          project_id: arr[0],
          device_id: arr[1],
          action_type: EDeviceCreditActionType.MINTED,
          nonce: arr[2],
          carbon_amount: Number(arr[3]),
          fee: Number(arr[4]),
          dcarbon_amount: Number(arr[5]),
          created_by: 'LAMBDA',
          tx_time: mintTime ? new Date(mintTime) : data.blockTime ? new Date(data.blockTime * 1000) : null, //FIXME: test only
        });
      }
    } catch (e) {
      if (throwError) throw e;
      LoggerUtil.error('Cannot sync mint transaction: ' + e.stack);
    }
  }
}

export default new MintingService();
