require("dotenv").config();

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');

const FileUtil = require(`./util/FileUtil`)

const app = express();

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-lfoqf.mongodb.net/images?retryWrites=true`, {
    useNewUrlParser: true
});

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extends: true }));
app.use(morgan('dev'));




app.use(`/files`, express.static(FileUtil.getStorageLocation()));
app.use(require('./routes/index'))

app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        return res.status(400).json({
            reason: error.message
        });
    } else if (err) {
        console.error(error);
        return res.status(500).json({
            reason: "An Internal error occurs."
        });
    }
    next();
})

app.listen(3000);