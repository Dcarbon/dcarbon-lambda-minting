import { middyfy } from '@libs/lambda';
import { ILambdaContext } from '@models/commons/ICommon.interface';
import { CommonJsonResponse, TCommonAPIGatewayProxyResult } from '@libs/api-gateway';
import { IMyRequest } from '@models/commons/ICommon.interface';
import RequestLogger from '../../commons/decorators/RequestLogger.decorator';

class CommonHandler {
  @RequestLogger()
  static async health(_request: IMyRequest, context: ILambdaContext): Promise<TCommonAPIGatewayProxyResult<any>> {
    return CommonJsonResponse<any>({
      request_id: context.awsRequestId,
      message: 'Alive',
    });
  }
}

export const HealthFn = middyfy(CommonHandler.health);
