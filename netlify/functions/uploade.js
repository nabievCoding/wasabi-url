// netlify/functions/getUploadUrl.js
const AWS = require("aws-sdk");

exports.handler = async () => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };

  try {
    const s3 = new AWS.S3({
      endpoint: "https://s3.ap-southeast-1.wasabisys.com",
      accessKeyId: process.env.WASABI_ACCESS_KEY,
      secretAccessKey: process.env.WASABI_SECRET_KEY,
      region: process.env.WASABI_REGION || "ap-southeast-1",
    });

    const fileName = `uploads/${Date.now()}.bin`; // yoki frontend’dan nom berishingiz mumkin

    const params = {
      Bucket: process.env.WASABI_BUCKET_NAME,
      Key: fileName,
      Expires: 60, // 1 daqiqa amal qiladi
      ACL: "public-read",
      ContentType: "application/octet-stream",
    };

    const url = await s3.getSignedUrlPromise("putObject", params);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ uploadUrl: url, fileUrl: url.split("?")[0] }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
