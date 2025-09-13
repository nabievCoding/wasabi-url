const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({
  region: "ap-southeast-1",
  endpoint: "https://s3.ap-southeast-1.wasabisys.com",
  credentials: {
    accessKeyId: process.env.WASABI_ACCESS_KEY,
    secretAccessKey: process.env.WASABI_SECRET_KEY,
  },
});

exports.handler = async (event) => {
  try {
    const { fileName } = event.queryStringParameters;

    if (!fileName) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: "fileName kerak",
        }),
      };
    }

    const key = `uploads/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.WASABI_BUCKET_NAME,
      Key: key,
      ACL: "public-read", // ommaga ochiq qilib qo‘yadi
      ContentType: "application/octet-stream",
    });

    // 60 soniya amal qiladigan upload URL
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        uploadUrl,
        fileUrl: `https://${process.env.WASABI_BUCKET_NAME}.s
