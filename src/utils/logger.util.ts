class Logger {
  request(message: any) {
    // eslint-disable-next-line no-console
    console.info('[REQUEST] ' + message);
  }

  info(message: any) {
    // eslint-disable-next-line no-console
    console.info(message);
  }

  debug(message: any) {
    // eslint-disable-next-line no-console
    console.debug(message);
  }

  error(message: any) {
    // eslint-disable-next-line no-console
    console.error('[ERROR]', message);
  }

  warning(message: any) {
    // eslint-disable-next-line no-console
    console.error('[WARNING]', message);
  }

  process(message: any) {
    // eslint-disable-next-line no-console
    console.info('[PROCESSING]', message);
  }

  success(message: any) {
    // eslint-disable-next-line no-console
    console.info('[SUCCESSFUL]', message);
  }
}

export default new Logger();
