const mongoose = require('mongoose');
const FileUtil = require(`../util/FileUtil`);
const aws = require(`aws-sdk`);

const ImageSchema = new mongoose.Schema({
    name: String,
    size: Number,
    key: String,
    url: String,
    hash: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

ImageSchema.pre(`save`, function () {
    if (!this.url) {
        this.url = `${process.env.APP_URL}/files/${this.key}`;
    }
});

ImageSchema.pre(`remove`, function () {
    FileUtil.removeFileFromStorage(this.key);
})

module.exports = mongoose.model('Image', ImageSchema);