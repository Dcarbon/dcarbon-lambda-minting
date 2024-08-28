import axios from 'axios';
import LoggerUtil from '@utils/logger.util';

import MyError from '@exceptions/my_error.exception';
import { EHttpStatus, EStatusMessages } from '@enums/http.enum';

import Timeout = NodeJS.Timeout;

class TelegramCommon {
  async sendMessage(topicId: string, msg: string, throwError = false): Promise<void> {
    let id: Timeout;
    try {
      return await new Promise(async (resolve, reject) => {
        try {
          const source = axios.CancelToken.source();
          id = setTimeout(() => {
            source.cancel(`Request cancel by time out error`);
            reject(new MyError(EHttpStatus.TimeOut, EStatusMessages[EHttpStatus.TimeOut]));
          }, Number(10000));
          const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendmessage?chat_id=${process.env.TELEGRAM_GROUP_ID}&message_thread_id=${topicId}&parse_mode=HTML&text=<code>${encodeURIComponent(msg)}</code>`;
          await axios.get(url);
          clearTimeout(id);
          resolve(null);
        } catch (e) {
          clearTimeout(id);
          reject(e);
        }
      });
    } catch (e) {
      LoggerUtil.error(`[TELEGRAM NOTIFICATION] Can not send message to Telegram ${e.stack}`);
      if (throwError) throw e;
    }
  }
}

export default new TelegramCommon();
