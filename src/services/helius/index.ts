import process from 'node:process';
import MyError from '@exceptions/my_error.exception';
import { EHttpStatus } from '@enums/http.enum';
import { ERROR_CODE } from '@constants/error.constant';
import LoggerUtil from '@utils/logger.util';
import HistoryService from '@services/history';
import { HeliusTxRawHook } from '../../interfaces/helius/helius.inteface';
import { MarketTransactionHistoryEntity } from '../../entities/market_history.entity';

class HeliusService {
  async syncTxHelius(rawTxs: HeliusTxRawHook[], secret: string): Promise<void> {
    LoggerUtil.info('rawTxs ' + JSON.stringify(rawTxs));
    LoggerUtil.info('secret ' + secret);
    if (process.env.COMMON_HELIUS_HOOK_SECRET !== secret)
      throw new MyError(
        EHttpStatus.BadRequest,
        ERROR_CODE.HOOK.PERMISSION_DENIED.code,
        ERROR_CODE.HOOK.PERMISSION_DENIED.msg,
      );
    const inputs: MarketTransactionHistoryEntity[] = [];
    rawTxs.forEach((transaction) => {
      let signature = 'UNKNOWN';
      try {
        const logs = transaction.meta?.logMessages;
        if (logs && logs.length > 6) {
          const buyInfoLog = logs.filter((log) => log.indexOf('buy_info-') === 0);
          if (buyInfoLog && buyInfoLog.length > 0) {
            const buyInfo = buyInfoLog[0].replace('buy_info-', '');
            const buyInfoArr = buyInfo.split('_');
            if (buyInfoArr.length > 1) {
              const seller = buyInfoArr[0];
              const buyer = buyInfoArr[1];
              const amount = buyInfoArr[2];
              const currency = buyInfoArr[3];
              const paymentTotal = buyInfoArr[4];
              signature = transaction.transaction?.signatures[0];
              if (signature) {
                inputs.push({
                  signature: signature,
                  seller,
                  buyer,
                  mint: 'NONE',
                  amount: Number(amount),
                  currency,
                  payment_total: Number(paymentTotal),
                  created_by: 'LAMBDA',
                });
              }
            }
          }
        }
      } catch (e) {
        LoggerUtil.error(`Cannot sync [IDO] of signature [${signature}] ${e.stack}`);
      }
    });
    await HistoryService.createMarketTxHistory(inputs);
  }
}

export default new HeliusService();
