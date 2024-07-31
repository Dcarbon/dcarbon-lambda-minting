import { handlerPath } from '@libs/handler-resolver';
import { API_VERSION } from '@constants/common.constant';

const PREFIX = `${API_VERSION}/common`;
export const health = {
  handler: `${handlerPath(__dirname)}/handler.healthHdl`,
  events: [
    {
      httpApi: {
        method: 'get',
        path: `${PREFIX}/health`,
      },
    },
  ],
};
