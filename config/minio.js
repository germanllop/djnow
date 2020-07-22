require('dotenv').config()
const Minio = require('minio')

const minioClient = new Minio.Client({
    endPoint: process.env.S3_ENDPOINT,
    port: 443,
    useSSL: true,
    accessKey: process.env.S3_ACCESS,
    secretKey: process.env.S3_SECRET
})

module.exports = minioClient