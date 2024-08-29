import { getTokenPrice, health } from '@functions/common';
import { minting, triggerMinting, triggerProjectMinting } from '@functions/minting';
import { syncTxHelius } from '@functions/hook';
import { triggerMintingSqs, triggerProjectMintingSqs } from '@functions/trigger';
import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'market-minting',
  frameworkVersion: '3',
  plugins: ['serverless-auto-swagger', 'serverless-esbuild', 'serverless-offline'],
  provider: {
    name: 'aws',
    stage: '${opt:stage}',
    timeout: 30,
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
      AWS_SQS_LAMBDA_SCHEDULE_MINTING_ARN:
        '${file(./env/env.${opt:stage, "dev"}.json):AWS_SQS_LAMBDA_SCHEDULE_MINTING_ARN}',
      AWS_SQS_LAMBDA_PROJECT_MINTING_ARN:
        '${file(./env/env.${opt:stage, "dev"}.json):AWS_SQS_LAMBDA_PROJECT_MINTING_ARN}',
      AWS_SQS_LAMBDA_PROJECT_MINTING_URL:
        '${file(./env/env.${opt:stage, "dev"}.json):AWS_SQS_LAMBDA_PROJECT_MINTING_URL}',
      EIP_712_DOMAIN_NAME: '${file(./env/env.${opt:stage, "dev"}.json):EIP_712_DOMAIN_NAME}',
      EIP_712_DOMAIN_CHAIN_ID: '${file(./env/env.${opt:stage, "dev"}.json):EIP_712_DOMAIN_CHAIN_ID}',
      EIP_712_DOMAIN_VERIFYING_CONTRACT:
        '${file(./env/env.${opt:stage, "dev"}.json):EIP_712_DOMAIN_VERIFYING_CONTRACT}',
      COMMON_SKIP_PREFLIGHT: '${file(./env/env.${opt:stage, "dev"}.json):COMMON_SKIP_PREFLIGHT}',
      COMMON_HELIUS_HOOK_SECRET: '${file(./env/env.${opt:stage, "dev"}.json):COMMON_HELIUS_HOOK_SECRET}',
      COMMON_USDC_ADDRESS: '${file(./env/env.${opt:stage, "dev"}.json):COMMON_USDC_ADDRESS}',
      COMMON_USDT_ADDRESS: '${file(./env/env.${opt:stage, "dev"}.json):COMMON_USDT_ADDRESS}',
      COMMON_MINT_LOOKUP_TABLE: '${file(./env/env.${opt:stage, "dev"}.json):COMMON_MINT_LOOKUP_TABLE}',
      ENDPOINT_IOT_API: '${file(./env/env.${opt:stage, "dev"}.json):ENDPOINT_IOT_API}',
      ENDPOINT_IPFS_NFT_IMAGE: '${file(./env/env.${opt:stage, "dev"}.json):ENDPOINT_IPFS_NFT_IMAGE}',
      TELEGRAM_BOT_TOKEN: '${file(./env/env.${opt:stage, "dev"}.json):TELEGRAM_BOT_TOKEN}',
      TELEGRAM_GROUP_ID: '${file(./env/env.${opt:stage, "dev"}.json):TELEGRAM_GROUP_ID}',
      TELEGRAM_MINTING_ALERT_TOPIC_ID: '${file(./env/env.${opt:stage, "dev"}.json):TELEGRAM_MINTING_ALERT_TOPIC_ID}',
      //SSM
      ENDPOINT_RPC: '${ssm:/market/${opt:stage, "dev"}/admin-backend/endpoint/endpoint_rpc}',
      POSTGRES_DB_HOST: '${ssm:/market/${opt:stage, "dev"}/admin-backend/postgres/postgres_db_host}',
      POSTGRES_DB_NAME: '${ssm:/market/${opt:stage, "dev"}/admin-backend/postgres/postgres_db_name}',
      POSTGRES_DB_USER: '${ssm:/market/${opt:stage, "dev"}/admin-backend/postgres/postgres_db_user}',
      POSTGRES_DB_PASSWORD: '${ssm:/market/${opt:stage, "dev"}/admin-backend/postgres/postgres_db_password}',
      COMMON_PYTH_TOKEN_PRICE: '/market/${opt:stage, "dev"}/admin-backend/common/common_pyth_token_price',
    },
    iam: {
      role: 'arn:aws:iam::${aws:accountId}:role/market-${opt:stage, "dev"}-lambda-minting-role',
    },
  },
  functions: {
    health,
    minting,
    triggerMinting,
    triggerProjectMinting,
    syncTxHelius,
    getTokenPrice,
    triggerMintingSqs,
    triggerProjectMintingSqs,
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
