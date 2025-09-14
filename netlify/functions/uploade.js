const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  endpoint: "https://s3.ap-southeast-1.wasabisys.com",
  region: "ap-southeast-1",
  accessKeyId: process.env.WASABI_ACCESS_KEY,
  secretAccessKey: process.env.WASABI_SECRET_KEY,
  signatureVersion: "v4",
});

exports.handler = async (event) => {
  // OPTIONS uchun CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
      body: "",
    };
  }

  try {
    const { fileName } = event.queryStringParameters || {};
    if (!fileName) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ success: false, error: "fileName required" }),
      };
    }

    const params = {
      Bucket: process.env.WASABI_BUCKET_NAME,
      Key: `uploads/${fileName}`,
      Expires: 300, // 5 daqiqa ishlaydigan URL
      ContentType: "application/octet-stream",
    };

    const uploadUrl = await s3.getSignedUrlPromise("putObject", params);
    const fileUrl = `https://${process.env.WASABI_BUCKET_NAME}.s3.ap-southeast-1.wasabisys.com/${params.Key}`;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
      body: JSON.stringify({ success: true, uploadUrl, fileUrl }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
