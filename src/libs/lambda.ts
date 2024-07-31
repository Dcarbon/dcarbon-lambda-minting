import middy from '@middy/core';
import middyJsonBodyParser from '@middy/http-json-body-parser';
import { responseHttpCode } from '@libs/middleware';

export const middyfy = (handler) => {
  return middy(handler).use(middyJsonBodyParser()).use(responseHttpCode());
};
