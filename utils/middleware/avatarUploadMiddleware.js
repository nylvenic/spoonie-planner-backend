const multer = require("multer");
const path = require('path');
const CONSTANTS = require('../CONSTANTS.js');
// Define the upload middleware with error handling
function uploadMiddleware(req, res, next) {
    const storage = multer.diskStorage({
        destination: 'public/avatars', // set the destination
        filename: function (req, file, cb) {
            // Create a unique filename with the original extension
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const extension = path.extname(file.originalname); // Get the extension from the original file name
            cb(null, uniqueSuffix + extension); // Append the extension
        }
    });
    
    const upload = multer({
        storage: storage,
        fileFilter: function (req, file, cb) {
            const filetypes = /jpeg|jpg|png|gif/;
            const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = filetypes.test(file.mimetype);

            if (mimetype && extname) {
                cb(null, true);
            } else {
                cb(new Error(CONSTANTS.RESPONSES.USER.AVATAR_CHANGE.INVALID_FILE_TYPE.msg), false);
            }
        },
        limits: { fileSize: CONSTANTS.MAX_FILESIZE } // Limits file size to 512KB
    }).single('file');

    upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            if (err.code === 'LIMIT_FILE_SIZE') {
                res.status(400).json(CONSTANTS.RESPONSES.USER.AVATAR_CHANGE.FILE_TOO_BIG);
            } else {
                res.status(400).json(CONSTANTS.RESPONSES.USER.AVATAR_CHANGE.GENERIC_ERROR);
            }
        } else if (err) {
            res.status(400).json({ msg: err.message, success: false });
        } else {
            next();
        }
    });
}

module.exports = uploadMiddleware;
