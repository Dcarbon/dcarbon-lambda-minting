import bs58 from 'bs58';
import { Keypair } from '@solana/web3.js';
import SecretManagerService from '@services/aws/secret_manager';
import MyError from '@exceptions/my_error.exception';
import { EHttpStatus } from '@enums/http.enum';
import { ERROR_CODE } from '@constants/error.constant';
import SolanaService from '@services/solana';
import LoggerUtil from '@utils/logger.util';

class MintingService {
  async minting(projectId: string, deviceId: string): Promise<any> {
    const deviceSetting = await SolanaService.getDeviceSetting(projectId, deviceId);
    if (!deviceSetting.is_active || !deviceSetting.device_id) {
      LoggerUtil.info(`Device [${deviceId}] of project [${projectId}] inactive`);
    } else {
      const singer = await this.getSignerKeypair(deviceSetting.minter.toString());
      await SolanaService.mintSNFT(
        singer,
        {
          name: `Carbon IOT${deviceId}`,
          symbol: `C${deviceId}`,
          image: `${process.env.AWS_S3_BUCKET_URL}/public/metadata/token/default_icon.png`,
        },
        {
          iot: '0x4d0155c687739bce9440ffb8aba911b00b21ea56',
          amount: '0x00',
          nonce: 1,
          signed: 'skN4F+Ebh3ShbfySpMCy+zfyrz8VwYUzdDo6RD+Ed4I8ItawaFZ2MYGSRd/6yXALOeOqsNIzsiOBufCI3shh4xw=',
        },
        projectId,
        deviceId,
        deviceSetting.owner,
      );
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
}

export default new MintingService();
