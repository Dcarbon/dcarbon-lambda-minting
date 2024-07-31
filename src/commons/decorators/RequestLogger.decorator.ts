import LoggerUtil from '@utils/logger.util';
import { IMyRequest } from '@models/commons/ICommon.interface';

const RequestLogger = (option?: { private: 'BODY'; privateFields: string[] }) => (target: any, _, descriptor: any) => {
  const method = descriptor.value;
  descriptor.value = async function (...args: any) {
    const request = args[0] as IMyRequest;
    const {
      queryStringParameters,
      body,
      rawPath,
      rawQueryString,
      requestContext: {
        http: { sourceIp, userAgent, method: httpMethod },
      },
    } = request;

    if (sourceIp) request.client_id = sourceIp;
    if (userAgent) request.user_agent = userAgent;
    let requestInfo = `Ip ${sourceIp || 'Can not detect'} ${httpMethod} ${rawPath}`;
    if (queryStringParameters && Object.keys(queryStringParameters).length > 0) {
      requestInfo = `${requestInfo}?${rawQueryString}`;
    }
    if (body && Object.keys(body).length > 0) {
      const bodyLog = { ...(body as any) };
      if (option?.private === 'BODY') {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        option?.privateFields.forEach((key) => {
          bodyLog[key] = '******';
        });
      }
      requestInfo = `${requestInfo}, body: ${JSON.stringify(bodyLog)}`;
    }
    LoggerUtil.request(requestInfo);
    return await method.apply(target, args);
  };
};
export default RequestLogger;
