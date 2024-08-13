import { handlerPath } from '@libs/handler-resolver';
import { API_VERSION } from '@constants/common.constant';

const PREFIX = `${API_VERSION}/common`;
export const syncTxHelius = {
  handler: `${handlerPath(__dirname)}/handler.SyncTxHeliusFn`,
  events: [
    {
      httpApi: {
        method: 'post',
        path: `${PREFIX}/hook/helius`,
        summary: 'Helius hook',
        swaggerTags: ['COMMON'],
      },
    },
  ],
};
