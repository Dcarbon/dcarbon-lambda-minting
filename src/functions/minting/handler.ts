import { middyfy } from '@libs/lambda';
import { ILambdaContext } from '@models/commons/ICommon.interface';
import { CommonJsonResponse, TCommonAPIGatewayProxyResult } from '@libs/api-gateway';
import MintingService from '@services/minting';
import RequestLogger from '../../commons/decorators/RequestLogger.decorator';
import { IDeviceMintingInput, IMintingInput, ITriggerMintingInput } from '../../interfaces/minting';

class MintingHandler {
  @RequestLogger()
  static async minting(_request: IMintingInput, context: ILambdaContext): Promise<TCommonAPIGatewayProxyResult<any>> {
    const data = await MintingService.minting(
      _request.body.project_id,
      _request.body.device_id,
      _request.body.amount,
      _request.body.nonce,
      _request.body.mint_time,
    );
    return CommonJsonResponse<any>({
      request_id: context.awsRequestId,
      data,
    });
  }

  @RequestLogger()
  static async triggerMinting(
    request: ITriggerMintingInput,
    context: ILambdaContext,
  ): Promise<TCommonAPIGatewayProxyResult<any>> {
    await MintingService.triggerMinting(request.body.minting_schedule);
    return CommonJsonResponse<any>({
      request_id: context.awsRequestId,
    });
  }

  @RequestLogger()
  static async deviceMinting(
    request: IDeviceMintingInput,
    context: ILambdaContext,
  ): Promise<TCommonAPIGatewayProxyResult<any>> {
    await MintingService.deviceMinting(String(request.body.device_id), String(request.body.project_id));
    return CommonJsonResponse<any>({
      request_id: context.awsRequestId,
    });
  }
}

export const MintingFn = middyfy(MintingHandler.minting);
export const DeviceMintingFn = middyfy(MintingHandler.deviceMinting);
export const TriggerMintingFn = middyfy(MintingHandler.triggerMinting);
