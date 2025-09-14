import AWS from "aws-sdk";

export async function handler(event) {
  try {
    const { fileKey } = event.queryStringParameters || {};

    if (!fileKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "fileKey kerak!" }),
      };
    }

    // Wasabi S3 sozlamalari
    const s3 = new AWS.S3({
      endpoint: "https://s3.ap-southeast-1.wasabisys.com",
      region: "ap-southeast-1",
      accessKeyId: process.env.WASABI_KEY,
      secretAccessKey: process.env.WASABI_SECRET,
      signatureVersion: "v4",
    });

    // Presigned URL yaratish (faylni yuklab olish uchun)
    const params = {
      Bucket: "databasevocabuzb", // o'z bucket nomingizni yozing
      Key: fileKey,
      Expires: 60, // URL amal qilish vaqti (sekundlarda)
      ResponseContentDisposition: "attachment", // fayl yuklab olish bo‘lib ketsin
    };

    const downloadUrl = await s3.getSignedUrlPromise("getObject", params);

    return {
      statusCode: 200,
      body: JSON.stringify({ downloadUrl }),
    };
  } catch (err) {
    console.error("Download error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Download link yaratishda xato" }),
    };
  }
}
