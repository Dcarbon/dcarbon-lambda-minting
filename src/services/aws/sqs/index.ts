import { SendMessageCommand, SendMessageCommandInput, SQSClient } from '@aws-sdk/client-sqs';
import { ICreateQueueOption } from '@services/aws/sqs/sqs.interface';
import LoggerUtil from '@utils/logger.util';

class SQSService {
  private client: SQSClient;

  constructor() {
    this.client = new SQSClient({
      region: process.env.AWS_RG,
    });
  }

  async createSQS<I>(option: ICreateQueueOption<I>, throwError = false): Promise<void> {
    LoggerUtil.process(
      `[QUEUE] Send message [${option?.message_group_id}] [${option?.message_deduplication_id}] with params [${JSON.stringify(
        option?.message_body,
      )}] `,
    );
    try {
      const input: SendMessageCommandInput = {
        MessageGroupId: option.message_group_id,
        MessageBody: JSON.stringify(option.message_body),
        MessageDeduplicationId: option.message_deduplication_id,
        QueueUrl: option.queue_url,
      };
      const cmd = new SendMessageCommand(input);
      await this.client.send(cmd);
      LoggerUtil.success(`[QUEUE] Send message [${option?.message_group_id}] [${option?.message_deduplication_id}]`);
    } catch (e) {
      LoggerUtil.error(
        `[QUEUE] Send message [${option?.message_group_id}] [${option?.message_deduplication_id}], ${e.stack}`,
      );
      if (throwError) throw e;
    }
  }
}

export default new SQSService();
