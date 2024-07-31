import { EErrorType, EHttpStatus } from '@enums/http.enum';
import { COMMON_ERROR_CODE } from '@constants/error.constant';
import Logger from '@utils/logger.util';

export const responseHttpCode = () => {
  return {
    onError: async (handler) => {
      const request_id = handler.context.awsRequestId;
      Logger.error(`${request_id} ${handler.error.stack}`);
      if (handler.error.errorCode) {
        if (handler.error.type === EErrorType.INPUT_ERROR) {
          handler.response = {
            statusCode: handler.error.errorCode,
            body: JSON.stringify({
              request_id: request_id,
              error_type: handler.error.type,
              error: handler.error.info,
            }),
            headers: { 'content-type': 'application/json; charset=utf-8' },
          };
        } else {
          const isShowMessage = ['develop', 'local'].includes(process.env.MODE) ? true : handler.error.isShowMessage;
          if (handler.error.statusCode === EHttpStatus.InternalServerError) {
            handler.response = {
              statusCode: EHttpStatus.InternalServerError,
              body: JSON.stringify({
                request_id: request_id,
                error: { code: COMMON_ERROR_CODE.ERROR_SERVER.code },
              }),
              headers: { 'content-type': 'application/json; charset=utf-8' },
            };
          } else {
            handler.response = {
              statusCode: handler.error.statusCode,
              body: JSON.stringify({
                request_id: request_id,
                error: {
                  code: handler.error.errorCode,
                  message: isShowMessage ? handler.error.message : undefined,
                  fields: handler.error.fields,
                },
              }),
              headers: { 'content-type': 'application/json; charset=utf-8' },
            };
          }
        }
      } else {
        const isShowMessage = ['develop', 'local'].includes(process.env.MODE) ? true : handler.error.isShowMessage;
        handler.response = {
          statusCode: EHttpStatus.InternalServerError,
          body: JSON.stringify({
            request_id: request_id,
            error: {
              code: COMMON_ERROR_CODE.ERROR_SERVER.code,
              message: isShowMessage ? handler.error.message : undefined,
            },
          }),
          headers: { 'content-type': 'application/json; charset=utf-8' },
        };
      }
    },
  };
};
