enum EMintScheduleType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

enum EMintingStatus {
  BURNING = 'burning',
  MINTING = 'minting',
  FINISHED = 'finished',
  REJECTED = 'rejected',
  ERROR = 'error',
}

export { EMintScheduleType, EMintingStatus };
