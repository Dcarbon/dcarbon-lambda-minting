import { EMintScheduleType } from '@enums/minting.enum';
import { ICommonRequest } from '../commons';

interface IMintingInput extends ICommonRequest {
  body: {
    amount: number;
    device_id: string;
    project_id: string;
    nonce: number;
    mint_time: number;
  };
}

interface ITriggerMintingInput extends ICommonRequest {
  body: {
    minting_schedule: EMintScheduleType;
  };
}

interface IDeviceMintingInput extends ICommonRequest {
  body: {
    device_id: number;
    project_id: number;
  };
}

interface IMetadataAttribute {
  trait_type: string;
  value: string;
}

interface ICreateMetadataInput {
  name: string;

  symbol: string;

  description?: string;

  image: string;

  attributes?: IMetadataAttribute[];
}

interface IIotSignatureInput {
  iot: string;
  amount: string;
  nonce: number;
  signed: string;
}

export { IMintingInput, ICreateMetadataInput, IIotSignatureInput, ITriggerMintingInput, IDeviceMintingInput };
