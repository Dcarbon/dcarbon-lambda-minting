import { APIGatewayProxyEventV2 } from 'aws-lambda';

interface ICommonRequest extends APIGatewayProxyEventV2 {
  requestId: string;
  body: any;
}
export { ICommonRequest };
