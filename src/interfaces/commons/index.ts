import { APIGatewayProxyEventV2 } from 'aws-lambda';

interface ICommonRequest extends APIGatewayProxyEventV2 {
  requestId: string;
  body: any;
}

type TTokenPythPrice = 'Crypto.SOL/USD' | 'Crypto.USDT/USD' | 'Crypto.USDC/USD';

interface IPythTokenPrice {
  token: TTokenPythPrice;
  price: number;
}

export { ICommonRequest, IPythTokenPrice, TTokenPythPrice };
