enum EHttpStatus {
  OK = 200,
  Created = 201,
  Accepted = 202,
  NoContent = 204,
  TemporaryRedirect = 307,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  TimeOut = 408,
  InternalServerError = 500,
  NotImplemented = 501,
  BadGateway = 502,
  ServiceUnavailable = 503,
}

const EStatusMessages: Record<EHttpStatus, string> = {
  [EHttpStatus.OK]: 'OK',
  [EHttpStatus.Created]: 'Created',
  [EHttpStatus.Accepted]: 'Accepted',
  [EHttpStatus.NoContent]: 'No Content',
  [EHttpStatus.BadRequest]: 'Bad Request',
  [EHttpStatus.Unauthorized]: 'Unauthorized',
  [EHttpStatus.Forbidden]: 'Forbidden',
  [EHttpStatus.NotFound]: 'Not Found',
  [EHttpStatus.InternalServerError]: 'Internal Server Error',
  [EHttpStatus.NotImplemented]: 'Not Implemented',
  [EHttpStatus.BadGateway]: 'Bad Gateway',
  [EHttpStatus.ServiceUnavailable]: 'Service Unavailable',
  [EHttpStatus.TimeOut]: 'Request Timeout',
  [EHttpStatus.TemporaryRedirect]: 'Temporary Redirect',
};

enum EErrorType {
  INPUT_ERROR = 'INPUT_ERROR',
  CUSTOM_ERROR = 'CUSTOM_ERROR',
}
export { EStatusMessages, EHttpStatus, EErrorType };
