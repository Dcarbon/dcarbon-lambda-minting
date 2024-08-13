import { middyfy } from '@libs/lambda';
import { ILambdaContext } from '@models/commons/ICommon.interface';
import { CommonJsonResponse, TCommonAPIGatewayProxyResult } from '@libs/api-gateway';
import { IMyRequest } from '@models/commons/ICommon.interface';
import HeliusService from '@services/helius';
import RequestLogger from '../../commons/decorators/RequestLogger.decorator';

class HookHandler {
  @RequestLogger()
  static async syncTxHelius(_request: IMyRequest, context: ILambdaContext): Promise<TCommonAPIGatewayProxyResult<any>> {
    await HeliusService.syncTxHelius(_request.body, _request.headers.authorization);
    return CommonJsonResponse<any>({
      request_id: context.awsRequestId,
    });
  }
}

export const SyncTxHeliusFn = middyfy(HookHandler.syncTxHelius);
