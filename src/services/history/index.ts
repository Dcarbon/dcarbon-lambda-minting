import DatasourceManager from '../../db/datasource';
import { DeviceTransactionHistoryEntity } from '../../entities/device_transaction_history.entity';
import { MarketTransactionHistoryEntity } from '../../entities/market_history.entity';

class HistoryService {
  async getAllDeviceTxHistories(): Promise<DeviceTransactionHistoryEntity[]> {
    const manager = await DatasourceManager.initialize();
    const histories = await manager.find(DeviceTransactionHistoryEntity);
    return histories;
  }

  async createDeviceTxHistory(data: DeviceTransactionHistoryEntity): Promise<void> {
    const manager = await DatasourceManager.initialize();
    await manager.upsert(DeviceTransactionHistoryEntity, data, {
      upsertType: 'on-conflict-do-update',
      skipUpdateIfNoValuesChanged: true,
      conflictPaths: ['signature'],
    });
  }

  async createMarketTxHistory(data: MarketTransactionHistoryEntity | MarketTransactionHistoryEntity[]): Promise<void> {
    const manager = await DatasourceManager.initialize();
    await manager.upsert(MarketTransactionHistoryEntity, data, {
      upsertType: 'on-conflict-do-update',
      skipUpdateIfNoValuesChanged: true,
      conflictPaths: ['signature'],
    });
  }
}

export default new HistoryService();
