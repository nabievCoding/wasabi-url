const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
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
    const { fileKey } = event.queryStringParameters;

    if (!fileKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: "fileKey kerak" }),
      };
    }

    const command = new GetObjectCommand({
      Bucket: process.env.WASABI_BUCKET_NAME,
      Key: fileKey, // bu to'liq "uploads/filename.jpg"
    });

    // 60 soniyaga amal qiladi
    const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        downloadUrl,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
