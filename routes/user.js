const express = require('express');
const router = express.Router();
const UserRepository = require('../repositories/UserRepository');

const userRepository = new UserRepository();
const authMiddleware = require('../utils/middleware/authMiddleware.js');
const errorHandler = require('../utils/errorHandler.js');
const avatarUploadMiddleware = require('../utils/middleware/avatarUploadMiddleware.js');

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

router.get('/users/:id/last-visited', authMiddleware, async (req, res, next) => {
    const id = req.params.id;
    try {
        const result = await userRepository.getLastVisited({userId:id});
        res.send(result);
    } catch(error) {
        next(error);
    }
});

router.put('/users/:id/last-visited', authMiddleware, async (req, res, next) => {
    const {id} = req.params;
    const {newDate} = req.body;
    try {
        const result = await userRepository.changeLastVisited({userId: id, newDate});
        res.send(result);
    } catch(error) {
        next(error);
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
router.put('/users/:id/avatar', avatarUploadMiddleware, authMiddleware, async (req, res, next) => {
    const {id} = req.params;
    const file = req.file;
    const {previousAvatar} = req.body;
    try {
        console.log(file);
        const result = await userRepository.changeAvatar({userId: id, filename: file.filename, previousAvatar});
        res.send(result);
    } catch(error) {
        next(error);
    }
});
router.put('/users/:id/browser-reminder', authMiddleware, async (req, res, next) => {
    const {id} = req.params;
    const {reminders} = req.body;
    try {
        const result = await userRepository.changeBrowserReminders({userId: id, reminders});
        res.send(result);
    } catch(error) {
        next(error);
    }
});
router.put('/users/:id/nickname', authMiddleware, async (req, res, next) => {
    const {id} = req.params;
    const {newNickname} = req.body;
    try {
        const result = await userRepository.changeNickname({userId: id, newNickname});
        res.send(result);
    } catch(error) {
        next(error);
    }
});
router.put('/users/:id/password', authMiddleware, async (req, res, next) => {
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