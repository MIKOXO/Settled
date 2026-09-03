import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env.js';

const createB2Client = () => {
  if (!env.B2_KEY_ID || !env.B2_APPLICATION_KEY || !env.B2_BUCKET_NAME) {
    return null;
  }

  return new S3Client({
    region: env.B2_REGION ?? 'us-east-005',
    endpoint: env.B2_ENDPOINT ?? 'https://s3.us-east-005.backblazeb2.com',
    credentials: {
      accessKeyId: env.B2_KEY_ID,
      secretAccessKey: env.B2_APPLICATION_KEY,
    },
  });
};

const b2Client = createB2Client();

export const uploadToB2 = async (buffer, key, contentType) => {
  if (!b2Client) {
    throw new Error('B2 storage is not configured');
  }

  await b2Client.send(
    new PutObjectCommand({
      Bucket: env.B2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  return key;
};

export const getSignedPhotoUrl = async (key) => {
  if (!b2Client || !key) {
    return null;
  }

  return getSignedUrl(
    b2Client,
    new GetObjectCommand({
      Bucket: env.B2_BUCKET_NAME,
      Key: key,
    }),
    { expiresIn: 3600 * 4 },
  );
};
