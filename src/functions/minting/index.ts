import { handlerPath } from '@libs/handler-resolver';
import { API_VERSION } from '@constants/common.constant';

const PREFIX = `${API_VERSION}/minting`;
export const minting = {
  handler: `${handlerPath(__dirname)}/handler.MintingFn`,
  events: [
    {
      httpApi: {
        method: 'post',
        path: `${PREFIX}`,
        summary: 'Trigger Minting Carbon (only for test)',
        swaggerTags: ['MINTING'],
        bodyType: 'IMintingBody',
      },
    },
  ],
};
export const deviceMinting = {
  handler: `${handlerPath(__dirname)}/handler.DeviceMintingFn`,
  events: [
    {
      httpApi: {
        method: 'post',
        path: `${PREFIX}/device`,
        summary: 'Trigger Minting Carbon by Device',
        swaggerTags: ['MINTING'],
        bodyType: 'IDeviceMintingBody',
      },
    },
  ],
};
export const triggerMinting = {
  handler: `${handlerPath(__dirname)}/handler.TriggerMintingFn`,
  events: [
    {
      httpApi: {
        method: 'post',
        path: `${PREFIX}/trigger`,
        summary: 'Trigger Minting Carbon',
        swaggerTags: ['MINTING'],
        bodyType: 'ITriggerMintingBody',
      },
    },
  ],
};
