// netlify/functions/upload.js
const AWS = require('aws-sdk');

exports.handler = async (event, context) => {
  // CORS sozlamalari
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // OPTIONS so'rovini qayta ishlash (CORS uchun)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Faqat POST so'rovlarni qabul qilish
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Faqat POST so\'rovlar qabul qilinadi' })
    };
  }

  try {
    console.log('Function ishga tushdi...');

    // Wasabi sozlamalari
    const s3 = new AWS.S3({
      endpoint: 'https://s3.ap-southeast-1.wasabisys.com',
      accessKeyId: process.env.WASABI_ACCESS_KEY,
      secretAccessKey: process.env.WASABI_SECRET_KEY,
      region: process.env.WASABI_REGION || 'ap-southeast-1'
    });

    // JSON ma'lumotlarini o'qish
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Noto\'g\'ri JSON formati' })
      };
    }

    const { fileName, fileData, fileType } = body;

    // Majburiy maydonlarni tekshirish
    if (!fileName || !fileData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'fileName va fileData majburiy' })
      };
    }

    // Base64 dan buffer ga o'tkazish
    const buffer = Buffer.from(fileData, 'base64');

    const params = {
      Bucket: process.env.WASABI_BUCKET_NAME,
      Key: `uploads/${Date.now()}_${fileName}`,
      Body: buffer,
      ContentType: fileType || 'application/octet-stream',
      ACL: 'public-read'
    };

    console.log('S3 ga yuklash boshlandi...');
    const result = await s3.upload(params).promise();
    console.log('S3 ga yuklash muvaffaqiyatli:', result.Location);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Fayl muvaffaqiyatli yuklandi!',
        url: result.Location,
        fileName: fileName
      })
    };

  } catch (error) {
    console.error('Xato:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Yuklash muvaffaqiyatsiz', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};
