// netlify/functions/getUploadUrl.js
const AWS = require("aws-sdk");

exports.handler = async (event) => { // <- event parametri qo'shildi
  console.log("Function called with event:", JSON.stringify(event));
  
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS, POST",
    "Content-Type": "application/json"
  };

  // CORS so'rovlarini qayta ishlash
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }

  try {
    // Wasabi sozlamalari
    const s3 = new AWS.S3({
      endpoint: "https://s3.ap-southeast-1.wasabisys.com",
      accessKeyId: process.env.WASABI_ACCESS_KEY,
      secretAccessKey: process.env.WASABI_SECRET_KEY,
      region: process.env.WASABI_REGION || "ap-southeast-1",
      signatureVersion: "v4"
    });

    // Query parametrlarini olish
    const { fname, fileName: frontendFileName, fileType } = event.queryStringParameters || {};
    
    // Fayl nomini aniqlash
    let finalFileName;
    if (frontendFileName) {
      finalFileName = frontendFileName;
    } else if (fname) {
      finalFileName = fname;
    } else {
      finalFileName = `file_${Date.now()}.bin`;
    }
    
    // Fayl nomini tozalash
    const cleanFileName = finalFileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `uploads/${Date.now()}_${cleanFileName}`;

    console.log("Generating URL for file:", key);
    console.log("File type:", fileType || "application/octet-stream");

    const params = {
      Bucket: process.env.WASABI_BUCKET_NAME,
      Key: key,
      Expires: 300, // 5 daqiqa (ko'proq vaqt)
      ACL: "public-read",
      ContentType: fileType || "application/octet-stream",
    };

    const uploadUrl = await s3.getSignedUrlPromise("putObject", params);
    const fileUrl = `https://${process.env.WASABI_BUCKET_NAME}.s3.ap-southeast-1.wasabisys.com/${key}`;

    console.log("Generated upload URL:", uploadUrl);
    console.log("Generated file URL:", fileUrl);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        uploadUrl: uploadUrl, 
        fileUrl: fileUrl,
        key: key
      }),
    };
  } catch (err) {
    console.error("Error details:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "URL yaratish muvaffaqiyatsiz",
        details: err.message 
      }),
    };
  }
};
