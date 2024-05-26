const express = require('express');
const router = express.Router();
const multer = require('multer');
const UserRepository = require('../repositories/UserRepository');
const path = require('path');

const userRepository = new UserRepository();
const authMiddleware = require('../utils/authMiddleware.js');
const errorHandler = require('../utils/errorHandler.js');
const storage = multer.diskStorage({
    destination: 'public/avatars', // set the destination
    filename: function (req, file, cb) {
        // Create a unique filename with the original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname); // Get the extension from the original file name
        cb(null, uniqueSuffix + extension); // Append the extension
    }
});
const upload = multer({ storage: storage });

router.post('/users/create', async (req, res, next) => {
    try {
        const result = await userRepository.create(req.body);
        res.send(result)
    } catch(error) {
        next(error);
    }
});

router.post('/users/login', async (req, res, next) => {
    try {
        const result = await userRepository.login(req.body);
        res.send(result)
    } catch(error) {
        next(error)
    }
});

router.get('/users/:id/spoons', authMiddleware, async (req, res, next) => {
    const id = req.params.id;
    try {
        const result = await userRepository.getSpoons(id);
        console.log(result);
        res.send(result);
    } catch(error) {
        next(error);
    }
});

router.put('/users/:id/spoons', authMiddleware, async (req, res, next) => {
    const {id} = req.params;
    const {replenish, cost, maxSpoons} = req.body;
    try {
        const result = await userRepository.changeSpoons({userId: id, cost, replenish, maxSpoons});
        res.send(result);
    } catch(error) {
        next(error);
    }
});

router.put('/users/:id/max-spoons', authMiddleware, async (req, res, next) => {
    const {id} = req.params;
    const {newMaxSpoons} = req.body;
    try {
        const result = await userRepository.changeMaxSpoons({userId:id, newMaxSpoons});
        res.send(result);
    } catch(error) {
        next(error);
    }
});
router.put('/users/:id/avatar', upload.single('file'), async (req, res, next) => {
    const {id} = req.params;
    const file = req.file;
    try {
        console.log(file);
        const result = await userRepository.changeAvatar({userId: id, filename: file.filename});
        res.send(result);
    } catch(error) {
        next(error);
    }
});
router.put('/users/:id/browser-reminder', async (req, res, next) => {
    const {id} = req.params;
    const {reminders} = req.body;
    try {
        const result = await userRepository.changeBrowserReminders({userId: id, reminders});
        res.send(result);
    } catch(error) {
        next(error);
    }
});
router.put('/users/:id/nickname', async (req, res, next) => {
    const {id} = req.params;
    const {newNickname} = req.body;
    try {
        const result = await userRepository.changeNickname({userId: id, newNickname});
        res.send(result);
    } catch(error) {
        next(error);
    }
});
router.put('/users/:id/password', async (req, res, next) => {
    const {id} = req.params;
    const {newPassword, oldPassword} = req.body;
    try {
        const result = await userRepository.changePassword({userId: id, newPassword, oldPassword});
        res.send(result);
    } catch(error) {
        next(error);
    }
});

router.use(errorHandler);

module.exports = router;