const express = require('express');
const router = express.Router();
const UserRepository = require('../repositories/UserRepository');

const userRepository = new UserRepository();
router.post('/users/create', async (req, res) => {
    try {
        const result = await userRepository.create(req.body);
        res.send(result)
    } catch(error) {
        res.send({
            error
        })
    }
});

router.post('/users/login', async (req, res) => {
    try {
        const result = await userRepository.login(req.body);
        res.send(result)
    } catch(error) {
        res.send({
            error
        })
    }
});

module.exports = router;