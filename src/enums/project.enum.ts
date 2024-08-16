enum EProjectStatus {
  REJECT = 'reject',
  ACTIVE = 'active',
  REGISTER = 'register',
}

enum EProjectType {
  PRJT_NONE = 'PrjT_None',
  PRJT_G = 'PrjT_G',
  PRJT_E = 'PrjT_E',
  PRJT_S = 'PrjT_S',
  PRJT_DRAFT = 'PrjT_Draft',
}

enum EIotProjectStatus {
  PrjS_None = 'PrjS_None',
  PrjS_Register = 'PrjS_Register',
  PrjS_Success = 'PrjS_Success',
}

export { EProjectStatus, EProjectType, EIotProjectStatus };
