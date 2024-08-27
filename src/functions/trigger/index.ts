import { handlerPath } from '@libs/handler-resolver';

export const triggerMintingSqs = {
  handler: `${handlerPath(__dirname)}/handler.TriggerMintingFn`,
  events: [
    {
      sqs: {
        arn: '${self:provider.environment.AWS_SQS_LAMBDA_MINTING_ARN}',
        batchSize: 1,
      },
    },
  ],
  memorySize: 5120,
  ephemeralStorageSize: 2048,
  timeout: 600,
  // vpc: {
  //   securityGroupIds: '${file(./env/env.${opt:stage, "dev"}.json):AWS_NAT_VPC_SG_IDS}' as unknown as string[], // @ts-ignore
  //   subnetIds: '${file(./env/env.${opt:stage, "dev"}.json):AWS_VPC_SUBNET_IDS}' as unknown as string[],
  // },
};
