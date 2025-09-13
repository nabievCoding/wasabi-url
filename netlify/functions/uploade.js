import AWS from 'aws-sdk'

exports.handler = async (event) => {
  // Faqat POST so'rovlarni qabul qilamiz
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Faqat POST so\'rovlar qabul qilinadi' })
    };
  }

  try {
    // Wasabi sozlamalari
    const s3 = new AWS.S3({
      endpoint: 'https://s3.ap-northeast-2.wasabisys.com',
      accessKeyId: process.env.WASABI_ACCESS_KEY,
      secretAccessKey: process.env.WASABI_SECRET_KEY,
      region: process.env.WASABI_REGION || 'ap-northeast-2'
    });

    const { fileName, fileData, fileType } = JSON.parse(event.body);

    // Base64 dan buffer ga o'tkazamiz
    const buffer = Buffer.from(fileData, 'base64');

    const params = {
      Bucket: process.env.WASABI_BUCKET_NAME,
      Key: `uploads/${Date.now()}_${fileName}`,
      Body: buffer,
      ContentType: fileType
    };

    const result = await s3.upload(params).promise();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        success: true,
        message: 'Fayl muvaffaqiyatli yuklandi!',
        url: result.Location
      })
    };

  } catch (error) {
    console.error('Xato:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ 
        error: 'Yuklash muvaffaqiyatsiz', 
        details: error.message 
      })
    };
  }
};