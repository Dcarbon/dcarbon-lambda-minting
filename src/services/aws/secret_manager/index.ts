import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import Logger from '@utils/logger.util';

class SecretManagerService {
  private client: SecretsManagerClient;

  constructor() {
    this.client = new SecretsManagerClient({
      region: process.env.AWS_RG,
    });
  }

  async getSecret(key: string): Promise<string | undefined> {
    try {
      Logger.process(`Get Secret with key [${key}]`);
      const params = new GetSecretValueCommand({
        SecretId: key,
      });
      const data = await this.client.send(params);
      Logger.success(`Get Secret with key [${key}]`);
      return data.SecretString;
    } catch (e) {
      Logger.error(`Get Secret with key [${key}] has error: ${e.stack}`);
      throw e;
    }
  }
}
export default new SecretManagerService();
