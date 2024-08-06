import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { DeviceTransactionHistoryEntity } from '../../entities/device_transaction_history.entity';
import DatasourceManager from '../../db/datasource';
import { MintingScheduleEntity } from '../../entities/minting_schedule.entity';

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
}

export default new ConfigService();
