const multer = require('multer');
const multerS3 = require('multer-s3');
const FileUtil = require('../util/FileUtil');
const aws = require('aws-sdk');
const fs = require('fs');

const localPath = FileUtil.getStorageLocation();

if (!fs.existsSync(localPath)) {
    fs.mkdirSync(localPath);
}

const storageTypes = {
    local: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, localPath);
        },
        filename: async (req, file, cb) => {
            try {
                file.key = await FileUtil.generateUniqueName(file.originalname);
                cb(null, file.key);
            } catch (error) {
                cb(error);
            }
        }
    }),
    s3: multerS3({
        s3: new aws.S3(),
        bucket: process.env.AWS_S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: process.env.AWS_S3_DEFAULT_ACL_UPLOADED_FILES,
        key: async (req, file, cb) => {
            try {
                file.key = await FileUtil.generateUniqueName(file.originalname);
                cb(null, file.key);
            } catch (error) {
                cb(error);
            }
        }
    })
}

module.exports = {
    dest: localPath,
    storage: storageTypes[process.env.STORAGE_TYPE],
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'image/jpeg',
            'image/pjpeg',
            'image/png',
            'image/gif'
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type.'));
        }
    }
}