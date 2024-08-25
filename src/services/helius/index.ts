import { Big } from 'big.js';
import MyError from '@exceptions/my_error.exception';
import { EHttpStatus } from '@enums/http.enum';
import { ERROR_CODE } from '@constants/error.constant';
import LoggerUtil from '@utils/logger.util';
import HistoryService from '@services/history';
import { ParsedTransactionWithMeta } from '@solana/web3.js';
import Solana from '@services/solana';
import { TTokenPythPrice } from '@interfaces/commons';
import { MarketTransactionHistoryEntity } from '@entities/market_history.entity';
import { MintHistoryEntity } from '@entities/mint_history.entity';
import { BurnHistoryEntity } from '@entities/burn_history.entity';

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
    const burnHistoryInputs: BurnHistoryEntity[] = [];
    await Promise.all(
      rawTxs.map(async (transaction) => {
        let signature = 'UNKNOWN';
        try {
          const logs = transaction.meta?.logMessages;
          if (logs) {
            const buyInfoLog = logs.filter((log) => log.indexOf('Program log: buy_info-') === 0);
            const mintInfoLog = logs.filter((log) => log.indexOf('Program log: Instruction: MintNft') === 0);
            const burnInfoLog = logs.filter((log) => log.indexOf('Program log: Instruction: BurnSft') === 0);
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
            } else if (burnInfoLog && burnInfoLog.length > 0) {
              await this.burnHistories(burnHistoryInputs, transaction);
            }
          }
        } catch (e) {
          LoggerUtil.error(`Cannot sync data of signature [${signature}] ${e.stack}`);
        }
      }),
    );
    if (inputs.length > 0) await HistoryService.createMarketTxHistory(inputs);
    if (mintInputs.length > 0) await HistoryService.createMintHistory(mintInputs);
    if (burnHistoryInputs.length > 0) await HistoryService.createBurnHistory(burnHistoryInputs);
  }

  async burnHistories(inputs: BurnHistoryEntity[], transaction: ParsedTransactionWithMeta): Promise<void> {
    const signature = transaction.transaction?.signatures[0];
    const preMount = (transaction?.meta?.preTokenBalances || []).reduce(
      (partialSum, info) => Big(partialSum).plus(Big(info.uiTokenAmount.uiAmount)).toNumber(),
      0,
    );
    const postMount = (transaction?.meta?.postTokenBalances || []).reduce(
      (partialSum, info) => Big(partialSum).plus(Big(info.uiTokenAmount.uiAmount)).toNumber(),
      0,
    );
    inputs.push({
      signature: signature,
      burner: transaction.transaction.message.accountKeys[0] as unknown as string,
      mints: (transaction?.meta?.preTokenBalances || []).map((info) => info.mint),
      amount: Big(preMount).minus(Big(postMount)).toNumber(),
      created_by: 'LAMBDA',
      block_hash: transaction.transaction.message.recentBlockhash,
      group_signature: transaction.transaction.message.recentBlockhash,
      tx_time: transaction.blockTime ? new Date(transaction.blockTime * 1000) : null,
    });
  }
}

export default new HeliusService();
