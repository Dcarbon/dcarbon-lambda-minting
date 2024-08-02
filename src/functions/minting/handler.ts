import { middyfy } from '@libs/lambda';
import { ILambdaContext } from '@models/commons/ICommon.interface';
import { CommonJsonResponse, TCommonAPIGatewayProxyResult } from '@libs/api-gateway';
import MintingService from '@services/minting';
import RequestLogger from '../../commons/decorators/RequestLogger.decorator';
import { IMintingInput } from '../../interfaces/minting';

class MintingHandler {
  @RequestLogger()
  static async minting(_request: IMintingInput, context: ILambdaContext): Promise<TCommonAPIGatewayProxyResult<any>> {
    const data = await MintingService.minting(_request.body.project_id, _request.body.device_id);
    return CommonJsonResponse<any>({
      request_id: context.awsRequestId,
      data,
    });
  }
}

export const MintingFn = middyfy(MintingHandler.minting);
