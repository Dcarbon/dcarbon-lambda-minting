import { Big } from 'big.js';
import MyError from '@exceptions/my_error.exception';
import { EHttpStatus } from '@enums/http.enum';
import { ERROR_CODE } from '@constants/error.constant';
import LoggerUtil from '@utils/logger.util';
import HistoryService from '@services/history';
import { ParsedTransactionWithMeta } from '@solana/web3.js';
import Solana from '@services/solana';
import { MarketTransactionHistoryEntity } from '../../entities/market_history.entity';
import { TTokenPythPrice } from '../../interfaces/commons';
import { MintHistoryEntity } from '../../entities/mint_history.entity';

class HeliusService {
  private BUY_TOKEN_MAP: { [key: string]: TTokenPythPrice } = {
    [process.env.COMMON_USDC_ADDRESS]: 'Crypto.USDC/USD',
    [process.env.COMMON_USDT_ADDRESS]: 'Crypto.USDT/USD',
    ['None']: 'Crypto.SOL/USD',
  };

  async syncTxHelius(rawTxs: ParsedTransactionWithMeta[], secret: string): Promise<void> {
    if (process.env.COMMON_HELIUS_HOOK_SECRET !== secret)
      throw new MyError(
        EHttpStatus.BadRequest,
        ERROR_CODE.HOOK.PERMISSION_DENIED.code,
        ERROR_CODE.HOOK.PERMISSION_DENIED.msg,
      );
    const inputs: MarketTransactionHistoryEntity[] = [];
    const mintInputs: MintHistoryEntity[] = [];
    await Promise.all(
      rawTxs.map(async (transaction) => {
        let signature = 'UNKNOWN';
        try {
          const logs = transaction.meta?.logMessages;
          if (logs) {
            const buyInfoLog = logs.filter((log) => log.indexOf('Program log: buy_info-') === 0);
            const mintInfoLog = logs.filter((log) => log.indexOf('Program log: Instruction: MintNft') === 0);
            signature = transaction.transaction?.signatures[0];
            if (buyInfoLog && buyInfoLog.length > 0) {
              LoggerUtil.process(`Helius sync BUY tx [${signature}]`);
              const buyInfo = buyInfoLog[0].replace('Program log: buy_info-', '');
              const buyInfoArr = buyInfo.split('-');
              if (buyInfoArr.length > 1) {
                const tokenPrices = await Solana.getPriceOfTokens([
                  'Crypto.SOL/USD',
                  'Crypto.USDT/USD',
                  'Crypto.USDC/USD',
                ]);
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
                if (signature) {
                  const historyData: MarketTransactionHistoryEntity = {
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
                  };
                  const matchPrice = tokenPrices.find((token) => token.token === this.BUY_TOKEN_MAP[currency]);
                  if (matchPrice) {
                    historyData.payment_total_usd = Big(paymentTotal).mul(Big(matchPrice.price)).toNumber();
                  }
                  inputs.push(historyData);
                }
                LoggerUtil.process(`Helius sync BUY tx [${signature}]`);
              }
            } else if (mintInfoLog && mintInfoLog.length > 0) {
              LoggerUtil.process(`Helius sync MINT tx [${signature}]`);
              mintInputs.push({
                signature: signature,
                mint: transaction?.meta?.postTokenBalances[0].mint,
                owner: transaction?.meta?.postTokenBalances[0].owner,
                tx_time: transaction.blockTime ? new Date(transaction.blockTime * 1000) : null,
                created_by: 'LAMBDA',
              });
            }
          }
        } catch (e) {
          LoggerUtil.error(`Cannot sync data of signature [${signature}] ${e.stack}`);
        }
      }),
    );
    if (inputs.length > 0) await HistoryService.createMarketTxHistory(inputs);
    if (mintInputs.length > 0) await HistoryService.createMintHistory(mintInputs);
  }
}

export default new HeliusService();
