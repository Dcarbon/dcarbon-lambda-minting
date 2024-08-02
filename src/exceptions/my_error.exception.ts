class MyError extends Error {
  statusCode: number;

  errorCode: string;

  type = 'CUSTOM_ERROR';

  fields: Object;

  message = 'Something went wrong';

  isShowMessage: boolean = false;

  constructor(statusCode: number, errorCode: string, message?: string, isShowMessage?: boolean, fields?: Object) {
    super(null);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.fields = fields;
    this.isShowMessage = isShowMessage;
    if (message) this.message = `[CUSTOM] ${message}`;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, MyError.prototype);
  }
}

export default MyError;
