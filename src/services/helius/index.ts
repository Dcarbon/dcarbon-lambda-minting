import process from 'node:process';
import MyError from '@exceptions/my_error.exception';
import { EHttpStatus } from '@enums/http.enum';
import { ERROR_CODE } from '@constants/error.constant';
import LoggerUtil from '@utils/logger.util';
import HistoryService from '@services/history';
import { ParsedTransactionWithMeta } from '@solana/web3.js';
import Solana from '@services/solana';
import { MarketTransactionHistoryEntity } from '../../entities/market_history.entity';

class HeliusService {
  async syncTxHelius(rawTxs: ParsedTransactionWithMeta[], secret: string): Promise<void> {
    LoggerUtil.info('rawTxs ' + JSON.stringify(rawTxs));
    LoggerUtil.info('secret ' + secret);
    if (process.env.COMMON_HELIUS_HOOK_SECRET !== secret)
      throw new MyError(
        EHttpStatus.BadRequest,
        ERROR_CODE.HOOK.PERMISSION_DENIED.code,
        ERROR_CODE.HOOK.PERMISSION_DENIED.msg,
      );
    const inputs: MarketTransactionHistoryEntity[] = [];
    await Promise.all(
      rawTxs.map(async (transaction) => {
        let signature = 'UNKNOWN';
        try {
          const logs = transaction.meta?.logMessages;
          if (logs) {
            const buyInfoLog = logs.filter((log) => log.indexOf('Program log: buy_info-') === 0);
            if (buyInfoLog && buyInfoLog.length > 0) {
              const buyInfo = buyInfoLog[0].replace('Program log: buy_info-', '');
              const buyInfoArr = buyInfo.split('-');
              if (buyInfoArr.length > 1) {
                const seller = buyInfoArr[0];
                const buyer = buyInfoArr[1];
                const amount = buyInfoArr[2];
                const currency = buyInfoArr[3];
                const paymentTotal = buyInfoArr[4];
                const listingPda = transaction.transaction.message.accountKeys[3];
                const listingInfo = await Solana.getListingInfo(listingPda as unknown as string);
                const mint =
                  transaction?.meta?.postTokenBalances && transaction?.meta?.postTokenBalances.length > 0
                    ? transaction?.meta?.postTokenBalances[0].mint
                    : undefined;
                signature = transaction.transaction?.signatures[0];
                if (signature) {
                  inputs.push({
                    signature: signature,
                    project_id: listingInfo ? String(listingInfo.projectId || '0') : undefined,
                    seller,
                    buyer,
                    mint,
                    amount: Number(amount),
                    currency: currency?.replace('Some(', '').replace(')', ''),
                    payment_total: Number(paymentTotal),
                    tx_time: transaction.blockTime ? new Date(transaction.blockTime * 1000) : null,
                    created_by: 'LAMBDA',
                  });
                }
              }
            }
          }
        } catch (e) {
          LoggerUtil.error(`Cannot sync [IDO] of signature [${signature}] ${e.stack}`);
        }
      }),
    );
    await HistoryService.createMarketTxHistory(inputs);
  }
}

export default new HeliusService();
