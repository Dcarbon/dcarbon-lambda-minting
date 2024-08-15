import { getTokenPrice, health } from '@functions/common';
import { minting, triggerMinting } from '@functions/minting';
import { syncTxHelius } from '@functions/hook';
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
    httpApi: {
      cors: {
        allowCredentials: true, // @ts-ignore
        allowedOrigins: '${file(./env/env.${opt:stage, "dev"}.json):COMMON_CORS_ORIGIN}', // @ts-ignore
        allowedHeaders: '${file(./env/env.${opt:stage, "dev"}.json):COMMON_CORS_HEADER}', // @ts-ignore
      },
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      AWS_RG: '${self:provider.region}',
      STAGE: '${opt:stage}',
      MODE: '${file(./env/env.${opt:stage, "dev"}.json):MODE}',
      ENDPOINT_API: '${file(./env/env.${opt:stage, "dev"}.json):ENDPOINT_API}',
      CONTRACT_CARBON_PROGRAM_ID: '${file(./env/env.${opt:stage, "dev"}.json):CONTRACT_CARBON_PROGRAM_ID}',
      AWS_S3_BUCKET_NAME: '${file(./env/env.${opt:stage, "dev"}.json):AWS_S3_BUCKET_NAME}',
      AWS_S3_BUCKET_URL: '${file(./env/env.${opt:stage, "dev"}.json):AWS_S3_BUCKET_URL}',
      EIP_712_DOMAIN_NAME: '${file(./env/env.${opt:stage, "dev"}.json):EIP_712_DOMAIN_NAME}',
      EIP_712_DOMAIN_CHAIN_ID: '${file(./env/env.${opt:stage, "dev"}.json):EIP_712_DOMAIN_CHAIN_ID}',
      EIP_712_DOMAIN_VERIFYING_CONTRACT:
        '${file(./env/env.${opt:stage, "dev"}.json):EIP_712_DOMAIN_VERIFYING_CONTRACT}',
      EIP_712_ETH_ADDRESS: '${file(./env/env.${opt:stage, "dev"}.json):EIP_712_ETH_ADDRESS}',
      COMMON_SKIP_PREFLIGHT: '${file(./env/env.${opt:stage, "dev"}.json):COMMON_SKIP_PREFLIGHT}',
      COMMON_HELIUS_HOOK_SECRET: '${file(./env/env.${opt:stage, "dev"}.json):COMMON_HELIUS_HOOK_SECRET}',
      COMMON_USDC_ADDRESS: '${file(./env/env.${opt:stage, "dev"}.json):COMMON_USDC_ADDRESS}',
      COMMON_USDT_ADDRESS: '${file(./env/env.${opt:stage, "dev"}.json):COMMON_USDT_ADDRESS}',
      //SSM
      ENDPOINT_RPC: '${ssm:/dcarbon/${opt:stage, "dev"}/admin-backend/endpoint/endpoint_rpc}',
      POSTGRES_DB_HOST: '${ssm:/dcarbon/${opt:stage, "dev"}/admin-backend/postgres/postgres_db_host}',
      POSTGRES_DB_NAME: '${ssm:/dcarbon/${opt:stage, "dev"}/admin-backend/postgres/postgres_db_name}',
      POSTGRES_DB_USER: '${ssm:/dcarbon/${opt:stage, "dev"}/admin-backend/postgres/postgres_db_user}',
      POSTGRES_DB_PASSWORD: '${ssm:/dcarbon/${opt:stage, "dev"}/admin-backend/postgres/postgres_db_password}',
      COMMON_PYTH_TOKEN_PRICE: '/dcarbon/${opt:stage, "dev"}/admin-backend/common/common_pyth_token_price',
    },
    iam: {
      role: 'arn:aws:iam::${aws:accountId}:role/dcarbon-${opt:stage, "dev"}-lambda-minting-role',
    },
  },
  functions: {
    health,
    minting,
    triggerMinting,
    syncTxHelius,
    getTokenPrice,
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
