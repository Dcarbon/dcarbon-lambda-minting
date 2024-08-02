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
