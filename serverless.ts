import { health } from '@functions/common';
import { minting } from '@functions/minting';
import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'dcarbon-minting',
  frameworkVersion: '3',
  plugins: ['serverless-auto-swagger', 'serverless-esbuild', 'serverless-offline'],
  provider: {
    name: 'aws',
    stage: '${opt:stage}',
    timeout: 900,
    runtime: 'nodejs18.x',
    region: 'ap-southeast-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
      binaryMediaTypes: ['*/*'],
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      AWS_RG: '${self:provider.region}',
      STAGE: '${opt:stage}',
      MODE: '${file(./env/env.${opt:stage, "dev"}.json):MODE}',
      ENDPOINT_API: '${file(./env/env.${opt:stage, "dev"}.json):ENDPOINT_API}',
      ENDPOINT_RPC: '${file(./env/env.${opt:stage, "dev"}.json):ENDPOINT_RPC}',
      CONTRACT_CARBON_PROGRAM_ID: '${file(./env/env.${opt:stage, "dev"}.json):CONTRACT_CARBON_PROGRAM_ID}',
      AWS_S3_BUCKET_NAME: '${file(./env/env.${opt:stage, "dev"}.json):AWS_S3_BUCKET_NAME}',
      AWS_S3_BUCKET_URL: '${file(./env/env.${opt:stage, "dev"}.json):AWS_S3_BUCKET_URL}',
      EIP_712_DOMAIN_NAME: '${file(./env/env.${opt:stage, "dev"}.json):EIP_712_DOMAIN_NAME}',
      EIP_712_DOMAIN_CHAIN_ID: '${file(./env/env.${opt:stage, "dev"}.json):EIP_712_DOMAIN_CHAIN_ID}',
      EIP_712_DOMAIN_VERIFYING_CONTRACT:
        '${file(./env/env.${opt:stage, "dev"}.json):EIP_712_DOMAIN_VERIFYING_CONTRACT}',
      EIP_712_ETH_ADDRESS: '${file(./env/env.${opt:stage, "dev"}.json):EIP_712_ETH_ADDRESS}',
      COMMON_SKIP_PREFLIGHT: '${file(./env/env.${opt:stage, "dev"}.json):COMMON_SKIP_PREFLIGHT}',
    },
    iam: {
      role: 'arn:aws:iam::${aws:accountId}:role/dcarbon-${opt:stage, "dev"}-lambda-minting-role',
    },
  },
  functions: {
    health,
    minting,
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node18',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 90,
    },
    developMode: {
      prod: false,
      other: false,
    },
    autoswagger: {
      title: 'DCarbon Minting',
      host: '${file(./env/env.${opt:stage, "dev"}.json):ENDPOINT_API}',
      typefiles: ['./src/types/common-types.d.ts'],
      excludeStages: ['prod'],
    },
  },
  resources: {},
};

module.exports = serverlessConfiguration;
