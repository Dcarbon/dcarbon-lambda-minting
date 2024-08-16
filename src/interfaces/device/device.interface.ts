import { EIotDeviceType } from '@enums/device.enum';
import { EProjectType } from '@enums/project.enum';

interface IIotDeviceType {
  id: EIotDeviceType;
  name: string;
}

interface IIotProjectType {
  id: number;
  code: EProjectType;
  name: string;
  active?: boolean;
}

export { IIotDeviceType, IIotProjectType };
