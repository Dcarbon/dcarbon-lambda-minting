const COMMON_ERROR_CODE = {
  REQUIRE: { code: 'ERROR1_01', msg: 'Required' },
  IS_NUMBER: { code: 'ERROR1_30', msg: 'Number required' },
  INVALID: { code: 'ERROR1_100', msg: 'Invalid data' },
  ERROR_SERVER: { code: 'ERROR2_001', msg: 'Server error' },
  TIMEOUT: { code: 'ERROR1_02', msg: 'Timeout error' },
};

const ERROR_CODE = {
  HOOK: {
    PERMISSION_DENIED: { code: 'ERROR4_001', msg: 'Permission denied' },
  },
  LAMBDA: {
    LAMBDA_INVOKE_ERROR: { code: 'ERROR2_001' },
  },
  MINTING: {
    MINTER_KEYPAIR_NOT_FOUND: { code: 'ERROR3_001', msg: 'Minter keypair not found' },
    DEVICE_NOT_REGISTER: { code: 'ERROR3_002', msg: 'Device not register' },
    DEVICE_NONCE_INVALID: { code: 'ERROR3_003', msg: 'Device nonce invalid' },
    CONTRACT_NOT_CONFIG: { code: 'ERROR3_004', msg: 'Contract not configured' },
  },
  PROJECT: {
    NOT_FOUND: { code: 'ERROR4_001', msg: 'Project not found' },
  },
  IOT_OP: {
    SIGN_NOT_FOUND: { code: 'ERROR5_001', msg: 'Sign not found' },
  },
  CONFIG: {
    MINTING_SIGNER_NOT_FOUND: { code: 'ERROR6_001', msg: 'Minting signer not found' },
    MINTER_BALANCE_TO_LOW: { code: 'ERROR6_002', msg: 'Minter balance is too low.' },
  },
};

export { ERROR_CODE, COMMON_ERROR_CODE };
