exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };

  const { fileName } = event.queryStringParameters || {};

  if (!fileName) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "fileName kerak" }),
    };
  }

  // Faylni bucket ichida saqlash nomi
  const finalName = `uploads/${Date.now()}-${fileName}`;

  const s3 = new AWS.S3({
    endpoint: "https://s3.ap-southeast-1.wasabisys.com",
    accessKeyId: process.env.WASABI_ACCESS_KEY,
    secretAccessKey: process.env.WASABI_SECRET_KEY,
    region: "ap-southeast-1",
  });

  const params = {
    Bucket: process.env.WASABI_BUCKET_NAME,
    Key: finalName,
    Expires: 60,
    ACL: "public-read",
    ContentType: "application/octet-stream",
  };

  const uploadUrl = s3.getSignedUrl("putObject", params);
  const fileUrl = `https://${process.env.WASABI_BUCKET_NAME}.s3.ap-southeast-1.wasabisys.com/${finalName}`;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ uploadUrl, fileUrl }),
  };
};
