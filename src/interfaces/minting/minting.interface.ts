import { PublicKey } from '@solana/web3.js';

class OCDeviceSetting {
  device_id: number;

  project_id: number;

  device_type: number;

  minter: PublicKey;

  owner: PublicKey;

  is_active: boolean;

  last_mint_time: number;

  nonce: number;
}

class OCContractSetting {
  vault: string;
}

class SignatureVerifyInfo {
  ethAddress: Buffer;

  message: Buffer;

  signature: Uint8Array;

  recoveryId: number;
}

export { OCDeviceSetting, SignatureVerifyInfo, OCContractSetting };
