const aws = require('aws-sdk');
const s3Zip = require('s3-zip');

const downloadWaivers = async (res, filenames, outputfilenames) => {
  const s3 = new aws.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    signatureVersion: 'v4',
  });

  return s3Zip
    .archive({ s3, bucket: process.env.S3_BUCKET_NAME }, '', filenames, outputfilenames)
    .pipe(res);
};

module.exports = { downloadWaivers };
