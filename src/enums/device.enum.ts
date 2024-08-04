enum EIotDeviceStatus {
  IOTS_ALL = 'IOTS_All',
  IOTS_NONE = 'IOTS_None',
  IOTS_REJECT = 'IOTS_Reject',
  IOTS_REGISTER = 'IOTS_Register',
  IOTS_SSUCCESS = 'IOTS_Success',
}

enum EIotDeviceType {
  ALL = -1,
  NONE = 0,
  WIND_POWER = 10,
  SOLAR_POWER = 11,
  BURN_METHANE = 20,
  BURN_BIOMASS = 21,
  FERTILIZER = 30,
  BURN_TRASH = 31,
}

enum EDeviceCreditActionType {
  MINTED = 'minted',
  SOLD = 'sold',
  LISTING = 'listing',
  BURN = 'burn',
}

enum EDeviceCreditHistoryType {
  DEFAULT = 'default',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export { EIotDeviceStatus, EDeviceCreditActionType, EDeviceCreditHistoryType, EIotDeviceType };
