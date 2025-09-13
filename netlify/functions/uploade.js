const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  endpoint: "https://s3.ap-southeast-1.wasabisys.com",
  region: "ap-southeast-1",
  accessKeyId: process.env.WASABI_ACCESS_KEY,
  secretAccessKey: process.env.WASABI_SECRET_KEY,
  signatureVersion: "v4",
});

exports.handler = async (event) => {
  try {
    const { fileName } = event.queryStringParameters;

    const params = {
      Bucket: process.env.WASABI_BUCKET_NAME,
      Key: `uploads/${fileName}`,
      Expires: 60,
      ACL: "public-read",
      ContentType: "application/octet-stream",
    };

    const uploadUrl = await s3.getSignedUrlPromise("putObject", params);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        uploadUrl,
        fileUrl: `https://${process.env.WASABI_BUCKET_NAME}.s3.ap-southeast-1.wasabisys.com/${params.Key}`,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
