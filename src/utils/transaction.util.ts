import {
  Connection,
  Keypair,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import LoggerUtil from '@utils/logger.util';
import { web3 } from '@coral-xyz/anchor';

interface ISendTxOption {
  connection: Connection;
  signers: Keypair[];
  payerKey: PublicKey;
  txInstructions?: TransactionInstruction;
  arrTxInstructions?: TransactionInstruction[];
}

const sendTx = async ({
  connection,
  signers,
  payerKey,
  txInstructions,
  arrTxInstructions,
}: ISendTxOption): Promise<{
  status: 'success' | 'error' | 'reject';
  tx?: string;
}> => {
  let tx: string | undefined;
  if (!txInstructions && (!arrTxInstructions || arrTxInstructions.length === 0)) {
    return {
      status: 'error',
      tx,
    };
  }
  try {
    const blockhash = await connection.getLatestBlockhashAndContext('confirmed');
    // const setComputeUnitPriceIx = ComputeBudgetProgram.setComputeUnitPrice({
    //   microLamports: Number(import.meta.env.VITE_COMPUTE_UNIT_PRICE || 100000),
    // });
    const messageV0 = new TransactionMessage({
      payerKey,
      recentBlockhash: blockhash.value.blockhash,
      instructions: txInstructions ? [txInstructions] : arrTxInstructions ? arrTxInstructions : [],
    }).compileToV0Message();
    const transactionV0 = new VersionedTransaction(messageV0);
    transactionV0.sign(signers);

    const blockHeight = await connection.getBlockHeight({
      commitment: 'confirmed',
      minContextSlot: blockhash.context.slot,
    });
    const transactionTTL = blockHeight + 151;
    const waitToConfirm = () => new Promise((resolve) => setTimeout(resolve, 5000));
    const waitToRetry = () => new Promise((resolve) => setTimeout(resolve, 2000));

    const numTry = 30;
    let isShoError = false;
    for (let i = 0; i < numTry; i++) {
      // check transaction TTL
      const blockHeightLoop = await connection.getBlockHeight('confirmed');
      if (blockHeightLoop >= transactionTTL) {
        throw new Error('ON_CHAIN_TIMEOUT');
      }

      const data = await connection.simulateTransaction(transactionV0, {
        replaceRecentBlockhash: true,
        commitment: 'confirmed',
      });
      if (!isShoError && String(process.env.COMMON_SKIP_PREFLIGHT) === '1' && data?.value?.err) {
        isShoError = true;
        LoggerUtil.error('SimulateTransaction Error ' + data?.value?.logs);
      }

      // @ts-ignore
      const sig = await web3.sendAndConfirmTransaction(connection, transactionV0, undefined, {
        skipPreflight: String(process.env.COMMON_SKIP_PREFLIGHT) === '1',
        maxRetries: 0,
        preflightCommitment: 'confirmed',
      });
      await waitToConfirm();

      const sigStatus = await connection.getSignatureStatus(sig);

      if (sigStatus.value?.err) {
        if (String(process.env.COMMON_SKIP_PREFLIGHT) === '1') {
          LoggerUtil.error('GetSignatureStatus Error ' + sigStatus.value?.err);
        }
        throw new Error('UNKNOWN_TRANSACTION');
      }
      if (sigStatus.value?.confirmationStatus === 'confirmed') {
        tx = sig;
        break;
      }

      await waitToRetry();
    }
    return {
      status: 'success',
      tx,
    };
  } catch (e: any) {
    if (e.message === 'User rejected the request.') {
      return {
        status: 'reject',
        tx,
      };
    }
    LoggerUtil.error(e);
    return {
      status: 'error',
      tx,
    };
  }
};
export { sendTx };
