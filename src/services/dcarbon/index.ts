import { ServiceResponse } from '@interfaces/commons';
import {
  IIotDevicesQuery,
  IotCommonResponse,
  IotDevice,
  IotProject,
  IotSign,
} from '@services/dcarbon/dcarbon.interface';
import Api from '@services/api';
import { IOT_API, IOT_DEFAULT_PAGING } from '@constants/iot.constant';
import MyError from '@exceptions/my_error.exception';
import { EHttpStatus } from '@enums/http.enum';
import { ERROR_CODE } from '@constants/error.constant';

class DCarbonService {
  private ENDPOINT_IOT_API = process.env.ENDPOINT_IOT_API;

  async projectDetail(id: string): Promise<ServiceResponse<IotProject>> {
    const result = await Api.get<any, IotProject>({
      url: `${this.ENDPOINT_IOT_API}${IOT_API.PROJECT.ROOT}/${id}`,
      cls: IotProject,
      plainToClass: true,
      byPassError: true,
      type: 'iot_api',
    });
    if (!result || !result.id)
      throw new MyError(EHttpStatus.BadRequest, ERROR_CODE.PROJECT.NOT_FOUND.code, ERROR_CODE.PROJECT.NOT_FOUND.msg);
    return {
      data: result,
    };
  }

  async latestDeviceSign(deviceId: string): Promise<ServiceResponse<IotSign>> {
    const result = await Api.get<any, IotSign>({
      url: `${this.ENDPOINT_IOT_API}${IOT_API.IOT_OP.ROOT}${IOT_API.IOT_OP.MINT_SIGN_LATEST.replace('{deviceId}', deviceId)}`,
      cls: IotSign,
      plainToClass: true,
      byPassError: true,
      type: 'iot_api',
    });
    if (!result || !result.id)
      throw new MyError(
        EHttpStatus.BadRequest,
        ERROR_CODE.IOT_OP.SIGN_NOT_FOUND.code,
        ERROR_CODE.IOT_OP.SIGN_NOT_FOUND.msg,
      );
    return {
      data: result,
    };
  }

  async getDevices(query: IIotDevicesQuery): Promise<ServiceResponse<IotDevice[]>> {
    const result = await Api.get<IIotDevicesQuery, IotCommonResponse<IotDevice[]>>({
      url: `${this.ENDPOINT_IOT_API}${IOT_API.DEVICE.ROOT}`,
      cls: IotCommonResponse<IotDevice[]>,
      plainToClass: true,
      byPassError: true,
      query,
      type: 'iot_api',
    });
    return {
      data: result.data || [],
      paging: {
        total: Number(result?.total || 0),
        page: Math.floor((query?.skip || IOT_DEFAULT_PAGING.skip) / (query?.limit || IOT_DEFAULT_PAGING.limit)) + 1,
        limit: query?.limit || IOT_DEFAULT_PAGING.limit,
      },
    };
  }
}

export default new DCarbonService();
