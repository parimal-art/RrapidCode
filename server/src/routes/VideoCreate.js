const express = require('express');
const AdminMiddleware = require('../middleware/adminMiddleware.js');
const videoRouter =  express.Router();
const {generateUploadSignature,saveVideoMetadata,deleteVideo} = require('../controllers/videosection.js');
videoRouter.get("/create/:problemId",AdminMiddleware,generateUploadSignature);
videoRouter.post("/save",AdminMiddleware,saveVideoMetadata);
videoRouter.delete("/delete/:problemId",AdminMiddleware,deleteVideo);


module.exports = videoRouter;