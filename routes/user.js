const express = require('express');
const router = express.Router();
const UserRepository = require('../repositories/UserRepository');

const userRepository = new UserRepository();
const authMiddleware = require('../utils/authMiddleware.js');
const errorHandler = require('../utils/errorHandler.js');
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
        console.log(result);
        res.send(result);
    } catch(error) {
        next(error);
    }
});

router.use(errorHandler);

module.exports = router;