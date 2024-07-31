import type { APIGatewayProxyResult } from 'aws-lambda';

type TStatusCode = 200 | 500 | 403;

interface ICommonDataResponse<T> {
  request_id: string;
  message?: string;
  data?: T;
}
export interface TCommonAPIGatewayProxyResult<T> extends APIGatewayProxyResult {
  data?: T;
}

export function CommonJsonResponse<T>(
  response: ICommonDataResponse<T>,
  status: TStatusCode = 200,
): TCommonAPIGatewayProxyResult<T> {
  return {
    statusCode: status,
    body: JSON.stringify({ request_id: response.request_id, ...response }),
    headers: { 'content-type': 'application/json; charset=utf-8' },
  };
}
