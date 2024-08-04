import { ICommonRequest } from '../commons';

interface IMintingInput extends ICommonRequest {
  body: {
    amount: number;
    device_id: string;
    project_id: string;
    nonce: number;
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

export { IMintingInput, ICreateMetadataInput, IIotSignatureInput };
