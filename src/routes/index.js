const routes = require('express').Router();
const multer = require('multer');
const multerConfig = require('../config/multer');
const Image = require('../model/Image');
const FileUtil = require('../util/FileUtil')

routes.get('/images', async (req, res) => {
    const images = await Image.find();
    res.json(images);
})

routes.post('/images', multer(multerConfig).single('file'), async (req, res) => {

    const { originalname: name, size, key, path, location: url } = req.file;
    const hash = await FileUtil.hashFile(path);
    const previousImage = await Image.find({
        hash
    });
    if (!previousImage || previousImage.length === 0) {
        const post = await Image.create({
            name,
            size,
            key,
            url,
            hash
        });
        return res.json(post._doc);
    } else {
        try {
            await FileUtil.deleFile(path);
        } catch (err) {
            console.error(`Failed to delete file: ${path}.`, err);
        }
        return res.status(400).json({
            reason: `This file already exists.`
        });
    }


});

routes.delete('/images/:id', async (req, res) => {
    const image = await Image.findById(req.params.id);
    if(!image){
        return res.send(404, {
            reason: `Cannot find an image with id=<${req.params.id}>.}`
        });
    }
    await image.remove();
    return res.send(202);
});

module.exports = routes;