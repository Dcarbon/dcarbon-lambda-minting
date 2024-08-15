import { SSMClient, GetParameterCommand, PutParameterCommand } from '@aws-sdk/client-ssm';
import Logger from '@utils/logger.util';

class SSMService {
  private client: SSMClient;

  constructor() {
    this.client = new SSMClient({
      region: process.env.AWS_RG,
    });
  }

  async getParameterCommand(key: string, throwError = false): Promise<string> {
    try {
      Logger.process(`Get SSM with key [${key}]`);
      const command = new GetParameterCommand({
        Name: key,
      });
      const response = await this.client.send(command);
      Logger.success(`Get SSM with key [${key}]`);
      return response?.Parameter?.Value;
    } catch (e) {
      Logger.error(`GET SSM with key [${key}] has error: ${e.message}`);
      if (throwError) throw e;
    }
  }

  async putParameterCommand(key: string, value: string, throwError = false): Promise<void> {
    try {
      Logger.process(`Put SSM with key [${key}]`);
      const command = new PutParameterCommand({
        Name: key,
        Value: value,
        Overwrite: true,
      });
      await this.client.send(command);
      Logger.success(`Put SSM with key [${key}]`);
    } catch (e) {
      Logger.error(`Put SSM with key [${key}] has error: ${e.message}`);
      if (throwError) throw e;
    }
  }
}

export default new SSMService();
