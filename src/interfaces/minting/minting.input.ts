import { ICommonRequest } from '../commons';

interface IMintingInput extends ICommonRequest {
  body: {
    minter: string;
    device_id: string;
    project_id: string;
  };
}
interface ICreateMetadataInput {
  name: string;

  symbol: string;

  description?: string;

  image: string;
}

interface IIotSignatureInput {
  iot: string;
  amount: string;
  nonce: number;
  signed: string;
}
export { IMintingInput, ICreateMetadataInput, IIotSignatureInput };
