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
  },
  PROJECT: {
    NOT_FOUND: { code: 'ERROR4_001', msg: 'Project not found' },
  },
};

export { ERROR_CODE, COMMON_ERROR_CODE };
