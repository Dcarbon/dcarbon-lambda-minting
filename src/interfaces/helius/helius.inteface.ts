class HeliusRawMeta {
  err?: any;

  fee: number;

  logMessages: string[];
}

class HeliusRawTransaction {
  message: {
    accountKeys: string[];
  };

  signatures: string[];
}

class HeliusTxRawHook {
  blockTime: number;

  indexWithinBlock: number;

  meta: HeliusRawMeta;

  slot: number;

  transaction: HeliusRawTransaction;

  version: string;
}

export { HeliusTxRawHook, HeliusRawTransaction, HeliusRawMeta };
