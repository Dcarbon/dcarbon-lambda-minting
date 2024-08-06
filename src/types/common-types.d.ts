import { EMintScheduleType } from '@enums/minting.enum';

export interface IHealthCheckResponse {
  request_id: string;
  message: string;
  data: {
    msg: string;
  };
}

export interface IMintingBody {
  minter: string;
  device_id: string;
  project_id: string;
}

type TMintScheduleType = Record<EMintScheduleType, string>;

export interface ITriggerMintingBody {
  minting_schedule: TMintScheduleType;
}
