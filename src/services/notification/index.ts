import { EMintScheduleType } from '@enums/minting.enum';
import TelegramCommon from '@commons/Telegram.common';
import { ERROR_CODE } from '@constants/error.constant';

class NotificationService {
  private TELEGRAM_MINTING_ALERT_TOPIC_ID = process.env.TELEGRAM_MINTING_ALERT_TOPIC_ID;

  async processingMinting(requestId: string, scheduleType: EMintScheduleType, projects: string[]): Promise<void> {
    const msg = `🔵 [PROCESSING] [${scheduleType.toUpperCase()}] MINTING
    
    
Project IDs: ${JSON.stringify(projects)}
Trace ID: ${requestId}`;
    await TelegramCommon.sendMessage(this.TELEGRAM_MINTING_ALERT_TOPIC_ID, msg);
  }

  async warningMinting(requestId: string, content: string): Promise<void> {
    const msg = `🟡 [WARNING] ${content}
Trace ID: ${requestId}`;
    await TelegramCommon.sendMessage(this.TELEGRAM_MINTING_ALERT_TOPIC_ID, msg);
  }

  async error(requestId: string, content: string): Promise<void> {
    const msg = `❌ [ERROR] ${content}
Trace ID: ${requestId}`;
    await TelegramCommon.sendMessage(this.TELEGRAM_MINTING_ALERT_TOPIC_ID, msg);
  }

  async minterBalanceLow(requestId: string, scheduleType: EMintScheduleType, balance: number): Promise<void> {
    const msg = `❌ [ERROR] [${scheduleType.toUpperCase()}] MINTING ERROR: ${ERROR_CODE.CONFIG.MINTER_BALANCE_TO_LOW.msg.toUpperCase()}
    
    
Balance: ${balance} SOL
Trace ID: ${requestId}`;
    await TelegramCommon.sendMessage(this.TELEGRAM_MINTING_ALERT_TOPIC_ID, msg);
  }

  async scheduleProjectMintingError(
    requestId: string,
    scheduleType: EMintScheduleType,
    projects: string[],
  ): Promise<void> {
    const msg = `❌ [ERROR] [${scheduleType.toUpperCase()}] MINTING ERROR: UNABLE TO SCHEDULE PROJECTS
    
    
Project IDs: ${JSON.stringify(projects)}
Trace ID: ${requestId}`;
    await TelegramCommon.sendMessage(this.TELEGRAM_MINTING_ALERT_TOPIC_ID, msg);
  }

  async scheduleProjectMintingSuccess(
    requestId: string,
    scheduleType: EMintScheduleType,
    projects: string[],
  ): Promise<void> {
    const msg = `✅ [SUCCESSFUL] [${scheduleType.toUpperCase()}] MINTING SCHEDULE PROJECTS SUCCESS:
    
    
Project Ids: ${JSON.stringify(projects)}
Trace ID: ${requestId}`;
    await TelegramCommon.sendMessage(this.TELEGRAM_MINTING_ALERT_TOPIC_ID, msg);
  }
}

export default new NotificationService();
