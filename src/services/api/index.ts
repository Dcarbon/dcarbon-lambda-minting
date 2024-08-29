import axios, { AxiosRequestConfig } from 'axios';
import { plainToInstance } from 'class-transformer';
import { GetRequestOption } from '@interfaces/commons';
import LoggerUtil from '@utils/logger.util';
import MyError from '@exceptions/my_error.exception';
import { EHttpStatus } from '@enums/http.enum';
import { COMMON_ERROR_CODE } from '@constants/error.constant';
import Timeout = NodeJS.Timeout;

class ApiService {
  public async get<I, O = any>(option: GetRequestOption<I, O>): Promise<O> {
    LoggerUtil.process(`API METHOD [GET] [${option.url}] QUERY [${JSON.stringify(option.query || {})}]`);
    try {
      return await new Promise(async (resolve, reject) => {
        let id: Timeout;
        try {
          const source = axios.CancelToken.source();
          id = setTimeout(
            () => {
              source.cancel(`Request cancel by time out error`);
              reject(
                new MyError(
                  EHttpStatus.InternalServerError,
                  COMMON_ERROR_CODE.TIMEOUT.code,
                  COMMON_ERROR_CODE.TIMEOUT.msg,
                ),
              );
            },
            Number(process.env.API_REQUEST_TIMEOUT || 20000),
          );
          let start = 0;
          if (process.env.PROCCESS_LOG === '1') start = Date.now();
          const config: AxiosRequestConfig = {
            cancelToken: source.token,
            params: { ...option.query },
            headers: { ...option.header },
          };
          const result: any = await axios.get(option.url, config);
          clearTimeout(id);
          if (process.env.PROCCESS_LOG === '1')
            LoggerUtil.info(`PROCESS REQUEST ${(Date.now() - start).toString()}ms ${option.url}`);
          let data: O = result?.data;
          if (option.plainToClass) {
            data = plainToInstance(option.cls as any, result?.data) as O;
          }
          LoggerUtil.success(`API METHOD [GET] [${option.url}]`);
          resolve(data);
        } catch (e) {
          LoggerUtil.error(
            `API METHOD [GET] [${option.url}] HAS ERROR, ${e.message} ${e.response?.data ? JSON.stringify(e.response?.data) : ''}`,
          );
          if (id) clearTimeout(id);
          reject(e);
        }
      });
    } catch (e) {
      if (option.type === 'iot_api' && e.response?.data && e.response?.data?.code === 2)
        throw new MyError(EHttpStatus.BadRequest, EHttpStatus.BadRequest.toString(), e.response?.data?.message);
      throw e;
    }
  }
}

export default new ApiService();
