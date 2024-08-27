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
    LoggerUtil.info(`[SQS TRIGGER] [SCHEDULE MINTING] with params [${JSON.stringify(request)}]`);
    await MintingService.triggerScheduleMinting(request.Records);
    return CommonJsonResponse<any>({
      request_id: context.awsRequestId,
    });
  }

  static async triggerProjectMinting(
    request: ILambdaTriggerEvent<ILambdaSqsTriggerEvent>,
    context: ILambdaContext,
  ): Promise<TCommonAPIGatewayProxyResult<any>> {
    LoggerUtil.info(`[SQS TRIGGER] [PROJECT MINTING] with params [${JSON.stringify(request)}]`);
    await MintingService.triggerProjectMinting(request.Records);
    return CommonJsonResponse<any>({
      request_id: context.awsRequestId,
    });
  }
}

export const TriggerMintingFn = TriggerHandler.triggerMinting;
export const TriggerProjectMintingFn = TriggerHandler.triggerProjectMinting;
