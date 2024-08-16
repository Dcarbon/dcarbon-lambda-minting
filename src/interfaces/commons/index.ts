import { IncomingHttpHeaders } from 'http';
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

declare type ClassType<T> = {
  new (...args: any[]): T;
};

interface GetRequestOption<I, O> {
  par?: string | number;
  byPassError?: boolean;
  header?: IncomingHttpHeaders;
  query?: I;
  plainToClass?: boolean;
  paging?: boolean;
  cls?: ClassType<O>;
  url: string;
  type: 'iot_api';
}

interface PostRequestOption<O> {
  plain?: boolean;
  cls?: ClassType<O>;
  defaultResponse?: any;
  bodyMode?: 'default' | 'urlencoded' | 'form-data';
  header?: IncomingHttpHeaders;
  logPrivate?: {
    mode: 'BODY' | 'PARAMS';
    fields: string[];
  };
  dataKey?: 'success' | string;
  byPassError?: boolean;
  returnBadRequest?: boolean;
  type: 'iot_api';
}

class PagingResponse {
  total: number;

  page: number;

  limit: number;
}

class ServiceResponse<T, C = any> {
  data: T;

  common?: C;

  paging?: PagingResponse;
}

export {
  ICommonRequest,
  IPythTokenPrice,
  TTokenPythPrice,
  GetRequestOption,
  ClassType,
  PostRequestOption,
  ServiceResponse,
  PagingResponse,
};
