import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { KeypairEntity } from '@entities/keypair.entity';
import { EKeypairType } from '@enums/keypair.enum';
import MyError from '@exceptions/my_error.exception';
import { EHttpStatus } from '@enums/http.enum';
import { ERROR_CODE } from '@constants/error.constant';
import { MintingScheduleEntity } from '../../entities/minting_schedule.entity';
import DatasourceManager from '../../db/datasource';
import { DeviceTransactionHistoryEntity } from '../../entities/device_transaction_history.entity';

class ConfigService {
  async getAllDeviceTxHistories(): Promise<DeviceTransactionHistoryEntity[]> {
    const manager = await DatasourceManager.initialize();
    const histories = await manager.find(DeviceTransactionHistoryEntity);
    return histories;
  }

  async getMintingSchedule(filter: FindOptionsWhere<MintingScheduleEntity>): Promise<MintingScheduleEntity[]> {
    const manager = await DatasourceManager.initialize();
    const schedules = await manager.find(MintingScheduleEntity, {
      where: filter,
      take: 99999,
    });
    return schedules;
  }

  async getMintingSigner(): Promise<KeypairEntity> {
    const manager = await DatasourceManager.initialize();
    const signers = await manager.find(KeypairEntity, {
      where: {
        type: EKeypairType.CARBON_MINT_SIGNER,
      },
      order: {
        created_at: 'desc',
      },
    });
    if (!signers || signers.length === 0)
      throw new MyError(
        EHttpStatus.InternalServerError,
        ERROR_CODE.CONFIG.MINTING_SIGNER_NOT_FOUND.code,
        ERROR_CODE.CONFIG.MINTING_SIGNER_NOT_FOUND.msg,
      );
    return signers[0];
  }
}

export default new ConfigService();
