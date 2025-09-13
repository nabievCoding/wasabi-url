// netlify/functions/upload.js
const AWS = require('aws-sdk');
const multiparty = require('multiparty');
const fs = require('fs');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Faqat POST so'rov qabul qilinadi" }),
    };
  }

  // Wasabi sozlamalari
  const s3 = new AWS.S3({
    endpoint: 'https://s3.ap-southeast-1.wasabisys.com',
    accessKeyId: process.env.WASABI_ACCESS_KEY,
    secretAccessKey: process.env.WASABI_SECRET_KEY,
    region: process.env.WASABI_REGION || 'ap-southeast-1',
  });

  return await new Promise((resolve) => {
    const form = new multiparty.Form();
    form.parse(event, async (err, fields, files) => {
      if (err) {
        return resolve({
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'FormData parsing xatosi' }),
        });
      }

      const file = files.file?.[0];
      if (!file) {
        return resolve({
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'file majburiy' }),
        });
      }

      try {
        const buffer = fs.readFileSync(file.path);

        const params = {
          Bucket: process.env.WASABI_BUCKET_NAME,
          Key: `uploads/${Date.now()}_${file.originalFilename}`,
          Body: buffer,
          ContentType: file.headers['content-type'] || 'application/octet-stream',
          ACL: 'public-read',
        };

        const result = await s3.upload(params).promise();
        return resolve({
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            url: result.Location,
            fileName: file.originalFilename,
          }),
        });
      } catch (uploadErr) {
        return resolve({
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: uploadErr.message }),
        });
      }
    });
  });
};
