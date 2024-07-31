import { IncomingHttpHeaders } from 'http';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

declare type ClassType<T> = {
  new (...args: any[]): T;
};

interface IMyRequest extends APIGatewayProxyEventV2 {
  queryStringParameters: APIGatewayProxyEventV2['queryStringParameters'];
  client_id?: string;
  requestId: string;
  user_agent: string;
  body: any;
}

interface GetRequestOption<T> {
  par?: string | number;
  byPassError?: boolean;
  header?: IncomingHttpHeaders;
  query?: object;
  plainToClass?: boolean;
  paging?: boolean;
  cls: ClassType<T>;
  url: string;
}

interface ApiOption<O> {
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
}

interface ILambdaContext {
  awsRequestId: string;
  callbackWaitsForEmptyEventLoop: boolean;
  clientContext?: any;

  functionName: string;

  functionVersion: string;

  invokedFunctionArn: string;

  logGroupName: string;

  logStreamName: string;

  memoryLimitInMB: string;
}

interface ILambdaTriggerEvent<T> {
  Records: T[];
}

interface IS3UploadOption {
  Bucket: string;
  Key: string;
  Body: any;
  ContentType?: string;
}

export { IMyRequest, ClassType, GetRequestOption, ILambdaContext, ApiOption, ILambdaTriggerEvent, IS3UploadOption };
