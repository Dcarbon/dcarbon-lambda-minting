import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { BN, IdlTypes, Program, web3 } from '@coral-xyz/anchor';
import {
  CreateArgsArgs,
  getCreateArgsSerializer,
  MPL_TOKEN_METADATA_PROGRAM_ID,
  TokenStandard,
} from '@metaplex-foundation/mpl-token-metadata';
import { ASSOCIATED_PROGRAM_ID, associatedAddress, TOKEN_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/utils/token';
import { percentAmount, some } from '@metaplex-foundation/umi';
import { ethers } from 'ethers';
import VerifyUtil from '@utils/verify.util';
import LoggerUtil from '@utils/logger.util';
import S3Service from '@services/aws/s3';
import { sendTx } from '@utils/transaction.util';
import { ICarbonContract } from '../../contracts/carbon/carbon.interface';
import { CARBON_IDL } from '../../contracts/carbon/carbon.idl';
import {
  ICreateMetadataInput,
  IIotSignatureInput,
  OCDeviceSetting,
  SignatureVerifyInfo,
} from '../../interfaces/minting';

type MintSftArgs = IdlTypes<ICarbonContract>['mintSftArgs'];
type VerifyMessageArgs = IdlTypes<ICarbonContract>['verifyMessageArgs'];

class SolanaService {
  private readonly connection: Connection;

  private program: Program<ICarbonContract>;

  private readonly TOKEN_METADATA_PROGRAM_ID: PublicKey;

  constructor() {
    this.connection = new Connection(process.env.ENDPOINT_RPC, 'confirmed');
    this.program = new Program<ICarbonContract>(CARBON_IDL as ICarbonContract, {
      connection: this.connection,
    });
    this.TOKEN_METADATA_PROGRAM_ID = new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID.toString());
  }

  async getDeviceSetting(projectId: string, deviceId: string): Promise<OCDeviceSetting> {
    const ocDeviceSetting = new OCDeviceSetting();
    const [deviceSettingProgram] = PublicKey.findProgramAddressSync(
      [Buffer.from('device'), new BN(Number(projectId)).toBuffer('le', 2), new BN(Number(deviceId)).toBuffer('le', 2)],
      this.program.programId,
    );
    const device = await this.program.account.device.fetch(deviceSettingProgram);
    if (device && device.id) {
      ocDeviceSetting.device_id = device.id;
      ocDeviceSetting.project_id = device.projectId;
      ocDeviceSetting.device_type = device.deviceType;
      ocDeviceSetting.minter = device.minter;
      ocDeviceSetting.owner = device.owner;
      const [deviceStatusProgram] = PublicKey.findProgramAddressSync(
        [Buffer.from('device_status'), new BN(Number(deviceId)).toBuffer('le', 2)],
        this.program.programId,
      );
      const activeData = await this.program.account.deviceStatus.fetch(deviceStatusProgram);
      if (activeData) {
        ocDeviceSetting.is_active = activeData.isActive;
        ocDeviceSetting.last_mint_time = activeData.lastMintTime?.toNumber();
        ocDeviceSetting.nonce = activeData.nonce;
      }
    }
    return ocDeviceSetting;
  }

  async generateMetadata(input: ICreateMetadataInput): Promise<string> {
    const path = await S3Service.upload({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `public/token/${input.symbol}.json`,
      ContentType: 'application/json',
      Body: JSON.stringify(input),
    });
    return path;
  }

  async mintSNFT(
    minter: Keypair,
    input: ICreateMetadataInput,
    signatureInput: IIotSignatureInput,
    projectId: string,
    deviceId: string,
    amount: number,
    nonce: number,
    owner: PublicKey,
  ): Promise<{ connection: Connection; signature: string }> {
    LoggerUtil.info('Minting SNFT with metadata: ' + JSON.stringify(input));
    const minterBalance = await this.connection.getBalance(minter.publicKey);
    LoggerUtil.info(`Minter balance: ${minterBalance}`);
    const uri = await this.generateMetadata(input);
    const mint = Keypair.generate();
    const decimals = 1;
    const [metadata] = PublicKey.findProgramAddressSync(
      [Buffer.from('metadata'), this.TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.publicKey.toBuffer()],
      this.TOKEN_METADATA_PROGRAM_ID,
    );

    const createArgsVec: CreateArgsArgs = {
      __kind: 'V1',
      name: input.name,
      symbol: input.symbol,
      uri,
      sellerFeeBasisPoints: percentAmount(5.5),
      decimals: some(decimals),
      creators: null,
      tokenStandard: TokenStandard.FungibleAsset,
    };

    const serialize1 = getCreateArgsSerializer();
    const data1 = serialize1.serialize(createArgsVec);

    const ownerAta = associatedAddress({
      mint: mint.publicKey,
      owner: owner,
    });

    const mintSftArgs: MintSftArgs = {
      projectId: Number(projectId),
      deviceId: Number(deviceId),
      createMintDataVec: Buffer.from(data1),
      totalAmount: new BN(amount * 10 ** decimals), // FIXME: hardcode
      nonce: Number(nonce),
    };

    const verifyInfo = await this.createSignatureVerifyInfo(signatureInput);
    const eth_address = process.env.EIP_712_ETH_ADDRESS;
    const ethAddress = ethers.utils.arrayify('0x' + eth_address);
    const verifyMessageArgs: VerifyMessageArgs = {
      msg: verifyInfo.message,
      recoveryId: verifyInfo.recoveryId,
      sig: Array.from(verifyInfo.signature),
      ethAddress: Array.from(ethAddress),
    };
    const ins0 = web3.Secp256k1Program.createInstructionWithEthAddress({
      ethAddress: ethAddress,
      message: verifyInfo.message,
      signature: verifyInfo.signature,
      recoveryId: verifyInfo.recoveryId,
    });

    const ins1 = await this.program.methods
      .mintSft(mintSftArgs, verifyMessageArgs)
      .accounts({
        signer: minter.publicKey,
        deviceOwner: owner,
        ownerAta: ownerAta,
        mint: mint.publicKey,
        metadata: metadata,
        tokenProgram: TOKEN_PROGRAM_ID,
        tokenMetadataProgram: this.TOKEN_METADATA_PROGRAM_ID,
        ataProgram: ASSOCIATED_PROGRAM_ID,
      })
      .instruction();
    const { tx, status } = await sendTx({
      connection: this.connection,
      signers: [minter, mint],
      arrTxInstructions: [ins0, ins1],
      payerKey: minter.publicKey,
    });
    if (status === 'error') {
      throw new Error(tx);
    }
    return {
      connection: this.connection,
      signature: tx,
    };
  }

  async createSignatureVerifyInfo(signatureInput: IIotSignatureInput): Promise<SignatureVerifyInfo> {
    const fullSig = '0x' + Buffer.from(signatureInput.signed, 'base64').toString('hex');

    const message = {
      iot: signatureInput.iot,
      amount: signatureInput.amount,
      nonce: signatureInput.nonce,
    };

    try {
      const domain = {
        name: process.env.EIP_712_DOMAIN_NAME,
        version: '1',
        chainId: Number(process.env.EIP_712_DOMAIN_CHAIN_ID),
        verifyingContract: process.env.EIP_712_DOMAIN_VERIFYING_CONTRACT,
      };

      const fullSigBytes = ethers.utils.arrayify(fullSig);

      const signature = fullSigBytes.slice(0, 64);

      const recoveryId = fullSigBytes[64] - 27;

      const prefix = Buffer.from('\x19\x01');

      const messageHash = VerifyUtil.structHash(VerifyUtil.types.primaryType, message);

      const domainSeparator = VerifyUtil.structHash('EIP712Domain', domain);

      const hashMessage = Buffer.concat([prefix, domainSeparator, messageHash]);

      const ethAddress = Buffer.from(message.iot.slice(2), 'hex');
      return {
        ethAddress: ethAddress,
        message: hashMessage,
        signature: signature,
        recoveryId: recoveryId,
      };
    } catch (e) {
      LoggerUtil.error(`Cannot create verify signature info, ${e.stack}`);
      throw e;
    }
  }
}

export default new SolanaService();
