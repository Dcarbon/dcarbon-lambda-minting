import { handlerPath } from '@libs/handler-resolver';
import { API_VERSION } from '@constants/common.constant';

const PREFIX = `${API_VERSION}/common`;
export const health = {
  handler: `${handlerPath(__dirname)}/handler.HealthFn`,
  events: [
    {
      httpApi: {
        method: 'get',
        path: `${PREFIX}/health`,
        summary: 'Check health service',
        swaggerTags: ['COMMON'],
      },
    },
  ],
};

export const getTokenPrice = {
  handler: `${handlerPath(__dirname)}/handler.GetTokenPriceFn`,
  events: [
    {
      httpApi: {
        method: 'get',
        path: `${PREFIX}/prices`,
        swaggerTags: ['COMMON'],
      },
    },
  ],
};
