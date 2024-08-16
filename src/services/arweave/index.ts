import Arweave from 'arweave';
import { JWKInterface } from 'arweave/node/lib/wallet';
import LoggerUtil from '@utils/logger.util';
import Secret_manager from '@services/aws/secret_manager';
import MyError from '@exceptions/my_error.exception';
import { EHttpStatus } from '@enums/http.enum';

class ArweaveService {
  private readonly arweave: Arweave;

  private readonly ARWEAVE_HOST: string;

  private JWK_CACHE: JWKInterface;

  constructor() {
    this.ARWEAVE_HOST = process.env.STAGE === 'prod' ? 'arweave.net' : 'arweave.dev';
    this.arweave = Arweave.init({
      logging: true,
      timeout: 20000,
      host: this.ARWEAVE_HOST,
      port: 443,
      protocol: 'https',
      logger: (log: string) => {
        LoggerUtil.info(`[NoID] ${log}`);
      },
    });
  }

  async getJwk(): Promise<JWKInterface> {
    if (this.JWK_CACHE) return this.JWK_CACHE;
    const jwkSecret = await Secret_manager.getSecret(`dcarbon/${process.env.STAGE}/arweave_secret`);
    if (!jwkSecret) throw new MyError(EHttpStatus.NotFound, EHttpStatus.NotFound.toString());
    this.JWK_CACHE = JSON.parse(jwkSecret);
    return this.JWK_CACHE;
  }

  async uploadMetadata(metadata: string | Uint8Array | ArrayBuffer, fileType: string): Promise<string> {
    try {
      LoggerUtil.process(`Creating transaction`);
      const jwk = await this.getJwk();
      const metadataTransaction = await this.arweave.createTransaction(
        {
          data: metadata,
        },
        jwk,
      );
      metadataTransaction.addTag('Content-Type', fileType);
      await this.arweave.transactions.sign(metadataTransaction, jwk);
      await this.arweave.transactions.post(metadataTransaction);
      const metadataUrl = `https://${this.ARWEAVE_HOST}/` + metadataTransaction.id;
      LoggerUtil.success(`Creating transaction`);
      return metadataUrl;
    } catch (e) {
      LoggerUtil.error(`Creating transaction has error: ${e.stack}`);
      throw e;
    }
  }
}

export default new ArweaveService();
