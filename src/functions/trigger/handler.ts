import { ILambdaContext, ILambdaTriggerEvent } from '@models/commons/ICommon.interface';
import { CommonJsonResponse, TCommonAPIGatewayProxyResult } from '@libs/api-gateway';
import MintingService from '@services/minting';
import { ILambdaSqsTriggerEvent } from '@interfaces/commons';
import LoggerUtil from '@utils/logger.util';

class TriggerHandler {
  static async triggerMinting(
    request: ILambdaTriggerEvent<ILambdaSqsTriggerEvent>,
    context: ILambdaContext,
  ): Promise<TCommonAPIGatewayProxyResult<any>> {
    LoggerUtil.info(`[SQS TRIGGER] [MINTING] with params [${JSON.stringify(request)}]`);
    await MintingService.triggerMinting(request.Records);
    return CommonJsonResponse<any>({
      request_id: context.awsRequestId,
    });
  }
}

export const TriggerMintingFn = TriggerHandler.triggerMinting;
