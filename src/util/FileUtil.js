const crypto = require('crypto');
const fs = require('fs');
const path = require(`path`);


const FileUtil = {

    hashFile: async (path, algorithime = `sha1`) => {

        return await new Promise((resolve, reject) => {

            let shaSum = crypto.createHash('sha1');
            const fileReader = fs.ReadStream(path);
            fileReader.on('data', (data) => {
                shaSum.update(data);
            });
            fileReader.on('end', async () => {
                resolve(shaSum.digest('hex'));
            });
        })
    },
    deleFile: async (path) => {
        return await new Promise((resolve, reject) => {
            fs.unlink(path, (err) => {
                if (err) reject(err);
                else
                    resolve();
            });
        })
    },
    generateUniqueName: async (initialName, bytes = 16) => {
        return await new Promise((resolve, reject) => {
            crypto.randomBytes(bytes, (err, hash) => {
                if (err) cb(err);
                const uniqueName = `${hash.toString('hex')}-${initialName}`;
                resolve(uniqueName);
            });
        });
    },
    getStorageLocation: () => {
        return process.env.STORAGE_LOCAL_PATH || path.resolve(__dirname, '..', '..', 'tmp', 'upload');
    },
    removeFileFromStorage: async (key) => {
        switch (process.env.STORAGE_TYPE) {
            case `local`: {
                const filePath = `${FileUtil.getStorageLocation()}\\${key}`
                try {
                    await FileUtil.deleFile(filePath);
                } catch (error) {
                    console.error(`Failed to delete file: ${filePath}.`, error);
                }
                break;
            }
            case `s3`: {
                const s3 = new aws.S3();
                return s3.deleteObject({
                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                    key
                }).promise()
                break;
            }
        }
    }
}

module.exports = FileUtil;
