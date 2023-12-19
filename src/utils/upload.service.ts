import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';

@Injectable()
export class UploadService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * upload an image to aws s3
   * @param file : image to be uploaded
   * @returns : upload result data
   */
  async uploadImage(file: Express.Multer.File, bucketName: BucketName) {
    try {
      const s3 = new S3({
        credentials: {
          accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY'),
          secretAccessKey: this.configService.get('AWS_S3_SECRET_KEY'),
        },
        region: this.configService.get('AWS_S3_REGION'),
      });

      // create params object that would be used to upload the image to the s3 bucket
      const params: AWS.S3.PutObjectRequest = {
        Bucket: bucketName,
        Key: `${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ACL: 'public-read',
      };

      // upload image
      const response = await s3.upload(params).promise();

      return response;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

export enum BucketName {
  IdCard = 'IdCard',
  Avatar = 'Avatar',
}
