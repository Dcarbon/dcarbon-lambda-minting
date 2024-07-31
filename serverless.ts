import { health } from '@functions/common';
import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'dcarbon-minting',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline'],
  provider: {
    name: 'aws',
    stage: '${opt:stage}',
    timeout: 20,
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
      MODE: '${file(./env/env.${opt:stage, "dev"}.json):MODE}',
      AWS_RG: '${self:provider.region}',
      STAGE: '${opt:stage}',
    },
    iam: {
      role: 'arn:aws:iam::${aws:accountId}:role/dcarbon-${opt:stage, "dev"}-lambda-minting-role',
    },
  },
  functions: {
    health,
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
  },
  resources: {},
};

module.exports = serverlessConfiguration;
