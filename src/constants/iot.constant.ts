import { EIotDeviceType } from '@enums/device.enum';
import { IIotDeviceType, IIotProjectType } from '@interfaces/device';
import { EProjectType } from '@enums/project.enum';

const IOT_API = {
  PROJECT: {
    ROOT: '/project',
  },
  DEVICE: {
    ROOT: '/iots',
  },
  IOT_OP: {
    ROOT: '/iot-op',
    MINT_SIGN_LATEST: '/mint-sign/{deviceId}/latest',
  },
};

const IOT_DEVICE_TYPE: IIotDeviceType[] = [
  {
    id: EIotDeviceType.ALL,
    name: 'All',
  },
  {
    id: EIotDeviceType.NONE,
    name: 'None',
  },
  {
    id: EIotDeviceType.WIND_POWER,
    name: 'Wind Power',
  },
  {
    id: EIotDeviceType.SOLAR_POWER,
    name: 'Solar Power',
  },
  {
    id: EIotDeviceType.BURN_METHANE,
    name: 'Burn Methane',
  },
  {
    id: EIotDeviceType.BURN_BIOMASS,
    name: 'Burn Biomass',
  },
  {
    id: EIotDeviceType.FERTILIZER,
    name: 'Fertilizer',
  },
  {
    id: EIotDeviceType.BURN_TRASH,
    name: 'Burn Trash',
  },
];

const IOT_PROJECT_TYPE: IIotProjectType[] = [
  {
    id: 0,
    code: EProjectType.PRJT_NONE,
    name: 'None',
    active: true,
  },
  {
    id: 1,
    code: EProjectType.PRJT_G,
    name: 'Model G',
    active: true,
  },
  {
    id: 2,
    code: EProjectType.PRJT_E,
    name: 'Model E',
    active: true,
  },
  {
    id: 3,
    code: EProjectType.PRJT_S,
    name: 'Model S',
    active: false,
  },
  {
    id: 4,
    code: EProjectType.PRJT_DRAFT,
    name: 'Draft',
    active: true,
  },
];
export { IOT_DEVICE_TYPE, IOT_API, IOT_PROJECT_TYPE };
