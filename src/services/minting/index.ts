import bs58 from 'bs58';
import { Connection, Keypair } from '@solana/web3.js';
import SecretManagerService from '@services/aws/secret_manager';
import MyError from '@exceptions/my_error.exception';
import { EHttpStatus } from '@enums/http.enum';
import { ERROR_CODE } from '@constants/error.constant';
import SolanaService from '@services/solana';
import LoggerUtil from '@utils/logger.util';
import { IOT_DEVICE_TYPE } from '@constants/iot.constant';
import HistoryService from '@services/history';
import { EDeviceCreditActionType } from '@enums/device.enum';
import { EMintScheduleType } from '@enums/minting.enum';
import ConfigService from '@services/config';

class MintingService {
  async triggerMinting(scheduleType: EMintScheduleType): Promise<void> {
    LoggerUtil.process(`Trigger minting [${scheduleType.toUpperCase()}]`);
    const schedules = await ConfigService.getMintingSchedule({ schedule_type: scheduleType });
    if (schedules.length > 0) {
      LoggerUtil.info(`Project minting: ${JSON.stringify(schedules.map((info) => info.project_id))}`);
    }
    LoggerUtil.success(`Trigger minting [${scheduleType.toUpperCase()}]`);
  }

  async minting(projectId: string, deviceId: string, amount: number, nonce: number, mint_time: number): Promise<any> {
    const deviceSetting = await SolanaService.getDeviceSetting(projectId, deviceId);
    if (!deviceSetting.is_active || !deviceSetting.device_id) {
      LoggerUtil.info(`Device [${deviceId}] of project [${projectId}] inactive`);
    } else {
      const singer = await this.getSignerKeypair(deviceSetting.minter.toString());
      const deviceType = IOT_DEVICE_TYPE.find((type) => type.id === deviceSetting.device_type);
      const { signature, connection } = await SolanaService.mintSNFT(
        singer,
        {
          name: `Carbon ${deviceId}-${nonce}`,
          symbol: `C${deviceId}-${nonce}`,
          image: `${process.env.AWS_S3_BUCKET_URL}/public/metadata/token/default_icon.png`,
          attributes: [
            {
              trait_type: 'Project',
              value: `Project ${projectId}`,
            },
            {
              trait_type: 'Device',
              value: `IOT ${deviceId}`,
            },
            {
              trait_type: 'Type',
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
        deviceSetting.owner,
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
    mintTime: number,
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
          created_by: 'None',
          // tx_time: data.blockTime ? new Date(data.blockTime * 1000) : null,
          tx_time: new Date(mintTime), //FIXME: test only
        });
      }
    } catch (e) {
      if (throwError) throw e;
      LoggerUtil.error('Cannot sync mint transaction: ' + e.stack);
    }
  }
}

export default new MintingService();
