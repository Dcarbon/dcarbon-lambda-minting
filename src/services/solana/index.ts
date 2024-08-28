import { AddressLookupTableProgram, Connection, Keypair, PublicKey, SYSVAR_INSTRUCTIONS_PUBKEY } from '@solana/web3.js';
import { BN, IdlTypes, Program, web3 } from '@coral-xyz/anchor';
import bs58 from 'bs58';
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
import { sendTx, u16ToBytes } from '@utils/transaction.util';
import { getPythClusterApiUrl, getPythProgramKeyForCluster, PriceStatus, PythHttpClient } from '@pythnetwork/client';
import Ssm from '@services/aws/ssm';
import Arweave from '@services/arweave';
import MyError from '@exceptions/my_error.exception';
import { EHttpStatus } from '@enums/http.enum';
import { ERROR_CODE } from '@constants/error.constant';
import {
  ICreateMetadataInput,
  IIotSignatureInput,
  OCContractSetting,
  OCDeviceSetting,
  SignatureVerifyInfo,
} from '@interfaces/minting';
import { IPythTokenPrice, TTokenPythPrice } from '@interfaces/commons';
import { ICarbonContract } from '@contracts/carbon/carbon.interface';
import { CARBON_IDL } from '@contracts/carbon/carbon.idl';
import { Big } from 'big.js';

type MintSftArgs = IdlTypes<ICarbonContract>['mintSftArgs'];
type VerifyMessageArgs = IdlTypes<ICarbonContract>['verifyMessageArgs'];

class SolanaService {
  private readonly connection: Connection;

  private readonly pythConnection: Connection;

  private readonly pythPublicKey: PublicKey;

  private program: Program<ICarbonContract>;

  private readonly TOKEN_METADATA_PROGRAM_ID: PublicKey;

  private tokenPrice: { info: IPythTokenPrice[]; lastUpdateTime: number };

  private vault: string;

  constructor() {
    this.connection = new Connection(process.env.ENDPOINT_RPC, 'confirmed');
    this.program = new Program<ICarbonContract>(CARBON_IDL as ICarbonContract, {
      connection: this.connection,
    });
    this.TOKEN_METADATA_PROGRAM_ID = new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID.toString());
    this.pythConnection = new Connection(getPythClusterApiUrl('pythnet'));
    this.pythPublicKey = getPythProgramKeyForCluster('pythnet');
  }

  async getBalanceOfWallet(wallet: string): Promise<number> {
    return await this.connection.getBalance(new PublicKey(wallet));
  }

  async contractSetting(): Promise<OCContractSetting> {
    if (this.vault)
      return {
        vault: this.vault,
      };
    try {
      const [configContract] = PublicKey.findProgramAddressSync(
        [Buffer.from('contract_config')],
        this.program.programId,
      );
      const config = await this.program.account.contractConfig.fetch(configContract);
      if (config) {
        this.vault = config.vault.toString();
        return {
          vault: this.vault,
        };
      }
    } catch (e) {
      LoggerUtil.error(e.stack);
      throw new MyError(
        EHttpStatus.BadRequest,
        ERROR_CODE.MINTING.CONTRACT_NOT_CONFIG.code,
        ERROR_CODE.MINTING.CONTRACT_NOT_CONFIG.msg,
      );
    }
  }

  async getDeviceSetting(projectId: string, deviceId: string): Promise<OCDeviceSetting> {
    const ocDeviceSetting = new OCDeviceSetting();
    const [deviceSettingProgram] = PublicKey.findProgramAddressSync(
      [Buffer.from('device'), new BN(Number(projectId)).toBuffer('le', 2), new BN(Number(deviceId)).toBuffer('le', 2)],
      this.program.programId,
    );
    let device: any | undefined;
    try {
      device = await this.program.account.device.fetch(deviceSettingProgram);
    } catch (e) {
      LoggerUtil.error(e.stack);
      throw new MyError(
        EHttpStatus.BadRequest,
        ERROR_CODE.MINTING.DEVICE_NOT_REGISTER.code,
        ERROR_CODE.MINTING.DEVICE_NOT_REGISTER.msg,
      );
    }
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
    lookupTable: string,
    minter: Keypair,
    input: ICreateMetadataInput,
    signatureInput: IIotSignatureInput,
    projectId: string,
    deviceId: string,
    amount: number,
    nonce: number,
    owner: PublicKey,
    collectFee: string,
  ): Promise<{ connection: Connection; signature: string }> {
    LoggerUtil.info('Minting SNFT with metadata: ' + JSON.stringify(input));
    const minterBalance = await this.connection.getBalance(minter.publicKey);
    LoggerUtil.info(`Minter balance: ${minterBalance}`);
    const uri = await Arweave.uploadMetadata(JSON.stringify(input), 'application/json');
    const mint = Keypair.generate();
    const decimals = 2;
    const [metadata] = PublicKey.findProgramAddressSync(
      [Buffer.from('metadata'), this.TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.publicKey.toBuffer()],
      this.TOKEN_METADATA_PROGRAM_ID,
    );
    const vault = new PublicKey(collectFee);
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

    const vaultAta = associatedAddress({
      mint: mint.publicKey,
      owner: vault,
    });

    const mintSftArgs: MintSftArgs = {
      projectId: Number(projectId),
      deviceId: Number(deviceId),
      createMintDataVec: Buffer.from(data1),
      totalAmount: Number(Number(amount).toFixed(2)), // FIXME: hardcode
      nonce: Number(nonce),
    };

    const verifyInfo = await this.createSignatureVerifyInfo(signatureInput);
    const eth_address = signatureInput.iot.slice(2);
    const ethAddress = ethers.utils.arrayify('0x' + eth_address);
    const verifyMessageArgs: VerifyMessageArgs = {
      msg: verifyInfo.message,
      recoveryId: verifyInfo.recoveryId,
      sig: Array.from(verifyInfo.signature),
      ethAddress: Array.from(ethAddress),
    };
    const [device] = PublicKey.findProgramAddressSync(
      [Buffer.from('device'), Buffer.from(u16ToBytes(Number(projectId))), Buffer.from(u16ToBytes(Number(deviceId)))],
      this.program.programId,
    );
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
        vaultAta: vaultAta,
        deviceOwner: owner,
        vault: vault,
        ownerAta: ownerAta,
        mint: mint.publicKey,
        metadata: metadata,
        sysvarProgram: SYSVAR_INSTRUCTIONS_PUBKEY,
      })
      .remainingAccounts([
        {
          pubkey: device,
          isSigner: false,
          isWritable: false,
        },
      ])
      .instruction();
    const lookupTableAccount = (await this.connection.getAddressLookupTable(new PublicKey(lookupTable))).value;
    const { tx, status } = await sendTx({
      connection: this.connection,
      signers: [minter, mint],
      arrTxInstructions: [ins0, ins1],
      payerKey: minter.publicKey,
      lookupTableAccount: lookupTableAccount,
    });
    if (status === 'error') {
      throw new Error(tx);
    }
    return {
      connection: this.connection,
      signature: tx,
    };
  }

  async mintDeviceSNFT(
    lookupTable: string,
    minter: Keypair,
    input: ICreateMetadataInput,
    signatureInput: IIotSignatureInput,
    projectId: string,
    deviceId: string,
    owner: PublicKey,
    collectFee: string,
  ): Promise<{ connection: Connection; signature: string; txTime: number }> {
    const decimals = 2;
    const amount = Number(
      Big(Number.parseInt(signatureInput.amount))
        .div(Big(10 ** 9))
        .toFixed(decimals),
    );
    if (amount < 0.01) {
      LoggerUtil.warning(`Device [${deviceId}] of project [${projectId}] not enough amount`);
      return;
    }
    LoggerUtil.process(`Minting [${amount}] sFT of device [${deviceId}] with nonce ${signatureInput.nonce}`);
    const uri = await Arweave.uploadMetadata(JSON.stringify(input), 'application/json');
    const mint = Keypair.generate();
    const [metadata] = PublicKey.findProgramAddressSync(
      [Buffer.from('metadata'), this.TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.publicKey.toBuffer()],
      this.TOKEN_METADATA_PROGRAM_ID,
    );
    const vault = new PublicKey(collectFee);
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

    const vaultAta = associatedAddress({
      mint: mint.publicKey,
      owner: vault,
    });

    const mintSftArgs: MintSftArgs = {
      projectId: Number(projectId),
      deviceId: Number(deviceId),
      createMintDataVec: Buffer.from(data1),
      totalAmount: amount,
      nonce: signatureInput.nonce,
    };

    const verifyInfo = await this.createSignatureVerifyInfo(signatureInput);
    const eth_address = signatureInput.iot.slice(2);
    const ethAddress = ethers.utils.arrayify('0x' + eth_address);
    const verifyMessageArgs: VerifyMessageArgs = {
      msg: verifyInfo.message,
      recoveryId: verifyInfo.recoveryId,
      sig: Array.from(verifyInfo.signature),
      ethAddress: Array.from(ethAddress),
    };
    const [device] = PublicKey.findProgramAddressSync(
      [Buffer.from('device'), Buffer.from(u16ToBytes(Number(projectId))), Buffer.from(u16ToBytes(Number(deviceId)))],
      this.program.programId,
    );
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
        vaultAta: vaultAta,
        deviceOwner: owner,
        vault: vault,
        ownerAta: ownerAta,
        mint: mint.publicKey,
        metadata: metadata,
        sysvarProgram: SYSVAR_INSTRUCTIONS_PUBKEY,
      })
      .remainingAccounts([
        {
          pubkey: device,
          isSigner: false,
          isWritable: false,
        },
      ])
      .instruction();
    const lookupTableAccount = (await this.connection.getAddressLookupTable(new PublicKey(lookupTable))).value;
    const { tx, status } = await sendTx({
      connection: this.connection,
      signers: [minter, mint],
      arrTxInstructions: [ins0, ins1],
      payerKey: minter.publicKey,
      lookupTableAccount: lookupTableAccount,
    });
    if (status === 'error') {
      throw new Error(tx);
    }
    LoggerUtil.success(`Minting [${amount}] sFT of device [${deviceId}] with nonce ${signatureInput.nonce}`);
    return {
      connection: this.connection,
      signature: tx,
      txTime: new Date().getTime(),
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

  async createMintLookUpTable(signer: Keypair): Promise<void> {
    const slot = await this.connection.getSlot();
    const [createLookupTableIns, lookupTableAddress] = AddressLookupTableProgram.createLookupTable({
      authority: signer?.publicKey,
      payer: signer?.publicKey,
      recentSlot: slot,
    });

    const extendInstruction = AddressLookupTableProgram.extendLookupTable({
      payer: signer?.publicKey,
      authority: signer?.publicKey,
      lookupTable: lookupTableAddress,
      addresses: [TOKEN_PROGRAM_ID, this.TOKEN_METADATA_PROGRAM_ID, ASSOCIATED_PROGRAM_ID],
    });
    const { tx, status } = await sendTx({
      connection: this.connection,
      signers: [signer],
      arrTxInstructions: [createLookupTableIns, extendInstruction],
      payerKey: signer.publicKey,
    });
    if (status === 'error') {
      throw new Error(tx);
    }
  }

  async getListingInfo(address: string): Promise<{
    owner: PublicKey;
    mint: PublicKey;
    amount: number;
    price: number;
    projectId: number;
    currency: PublicKey;
    remaining: number;
  }> {
    try {
      const data = await this.program.account.tokenListingInfo.fetch(new PublicKey(address));
      return data;
    } catch (e) {}
  }

  async getPriceOfTokens(tokens: TTokenPythPrice[]): Promise<IPythTokenPrice[]> {
    const currentTime = new Date().getTime();
    if (
      this.tokenPrice &&
      this.tokenPrice.info.length >= tokens.length &&
      currentTime - (this.tokenPrice.lastUpdateTime || 0) <= 60_000
    ) {
      LoggerUtil.info(`Get price from cache`);
      return this.tokenPrice.info;
    }
    LoggerUtil.info(`Get price from PYTH`);
    const pythClient = new PythHttpClient(this.pythConnection, this.pythPublicKey);
    const data = await pythClient.getData();
    let prices: IPythTokenPrice[] = [];
    for (const symbol of tokens) {
      try {
        const price = data.productPrice.get(symbol);
        if (price.price && price.confidence) {
          prices.push({
            token: symbol,
            price: price.price,
          });
        } else {
          LoggerUtil.error(`${symbol}: price currently unavailable. status is ${PriceStatus[price.status]}`);
        }
      } catch (e) {
        LoggerUtil.error(`Cannot get price from PYTH: ${e.stack}`);
      }
    }
    if (prices.length > 0) {
      this.tokenPrice = {
        info: prices,
        lastUpdateTime: currentTime,
      };
      await Ssm.putParameterCommand(process.env.COMMON_PYTH_TOKEN_PRICE, JSON.stringify(prices));
    } else {
      LoggerUtil.info(`Get price from SSM`);
      const strPrice = await Ssm.getParameterCommand(process.env.COMMON_PYTH_TOKEN_PRICE);
      if (strPrice) prices = JSON.parse(strPrice) as IPythTokenPrice[];
    }
    return prices;
  }

  async getDevicesRegisteredOfProject(projectId: string): Promise<number[]> {
    const accounts = await this.connection.getProgramAccounts(this.program.programId, {
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: bs58.encode(
              CARBON_IDL?.accounts.find((acc: { name: string; discriminator: number[] }) => acc.name === 'Device')
                ?.discriminator as number[],
            ),
          },
        },
        {
          memcmp: {
            offset: 8 + 2 + 2,
            bytes: bs58.encode(u16ToBytes(Number(projectId))),
          },
        },
      ],
    });
    const devicesRegistered: number[] = [];
    accounts?.forEach((data) => {
      if (data.account.data) {
        const deviceId = data.account.data.subarray(8, 8 + 2).readInt16LE();
        devicesRegistered.push(deviceId);
      }
    });
    return devicesRegistered;
  }
}

export default new SolanaService();
