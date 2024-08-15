import { middyfy } from '@libs/lambda';
import { ILambdaContext } from '@models/commons/ICommon.interface';
import { CommonJsonResponse, TCommonAPIGatewayProxyResult } from '@libs/api-gateway';
import { IMyRequest } from '@models/commons/ICommon.interface';
import HistoryService from '@services/history';
import SolanaService from '@services/solana';
import RequestLogger from '../../commons/decorators/RequestLogger.decorator';
import { IPythTokenPrice } from '../../interfaces/commons';

class CommonHandler {
  @RequestLogger()
  static async health(_request: IMyRequest, context: ILambdaContext): Promise<TCommonAPIGatewayProxyResult<any>> {
    await HistoryService.getAllDeviceTxHistories();
    return CommonJsonResponse<any>({
      request_id: context.awsRequestId,
      message: 'Alive',
    });
  }

  @RequestLogger()
  static async getTokenPrice(
    _request: IMyRequest,
    context: ILambdaContext,
  ): Promise<TCommonAPIGatewayProxyResult<any>> {
    const prices = await SolanaService.getPriceOfTokens(['Crypto.SOL/USD', 'Crypto.USDT/USD', 'Crypto.USDC/USD']);
    return CommonJsonResponse<IPythTokenPrice[]>({
      request_id: context.awsRequestId,
      data: prices,
    });
  }
}

export const HealthFn = middyfy(CommonHandler.health);
export const GetTokenPriceFn = middyfy(CommonHandler.getTokenPrice);
