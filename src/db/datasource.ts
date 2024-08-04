import { DataSource, EntityManager } from 'typeorm';
import LoggerUtil from '@utils/logger.util';
import { DeviceTransactionHistoryEntity } from '../entities/device_transaction_history.entity';

class DatasourceManager {
  public manager: EntityManager;

  async initialize(): Promise<EntityManager> {
    if (this.manager) return this.manager;
    LoggerUtil.process('Data Source connecting');
    const AppDataSource = new DataSource({
      type: 'postgres',
      host: process.env.POSTGRES_DB_HOST,
      port: 5432,
      username: process.env.POSTGRES_DB_USER,
      password: process.env.POSTGRES_DB_PASSWORD,
      database: process.env.POSTGRES_DB_NAME,
      entities: [DeviceTransactionHistoryEntity],
    });
    await AppDataSource.initialize()
      .then(() => {
        LoggerUtil.success('Data Source has been initialized!');
      })
      .catch((err) => {
        LoggerUtil.error('Error during Data Source initialization: ' + err.message);
      });
    this.manager = AppDataSource.manager;
    return this.manager;
  }
}

export default new DatasourceManager();
