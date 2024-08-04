import { EIotDeviceType } from '@enums/device.enum';
import { IIotDeviceType } from '../interfaces/device';

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
export { IOT_DEVICE_TYPE };
