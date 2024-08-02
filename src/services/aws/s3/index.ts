import { PutObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';

class S3Service {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: process.env.AWS_RG,
    });
  }

  async upload(input: PutObjectCommandInput): Promise<string> {
    const command = new PutObjectCommand(input);

    await this.client.send(command);

    return `${process.env.AWS_S3_BUCKET_URL}/${input.Key}`;
  }
}

export default new S3Service();
