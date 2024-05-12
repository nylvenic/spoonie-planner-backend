const express = require('express');
const router = express.Router();
const errorHandler = require('../utils/errorHandler.js');
const TodoRepository = require('../repositories/TodoRepository.js');
const todoRepository = new TodoRepository();
const jwt = require('jsonwebtoken');
const authMiddleware = require('../utils/authMiddleware.js');

router.use('/todos', authMiddleware);

router.post('/todos/create', async (req, res, next) => {
    try {
        const data = {
            userId: req.user.userId,
            ...req.body
        };
        const result = await todoRepository.create(data);
        res.json(result);
    } catch(err) {
        next(err);
    }
});

router.put('/todos/:id', async (req, res, next) => {
    try {
        const {id} = req.params;
        const data = {
            userId: req.user.userId,
            ...req.body
        };
        const result = await todoRepository.update({data, id});
        res.json(result);
    } catch(err) {
        next(err);
    }
});

router.put('/todos/:id/complete', async (req, res, next) => {
    try {
        const {id} = req.params;
        const {newStatus} = req.body;
        if(newStatus == null) res.status(400).json({error: 'Bad request, newStatus is required.'})
        const result = await todoRepository.setCompleted({id, newStatus});
        res.json(result);
    } catch(err) {
        next(err);
    }
});

router.put('/todos/:id/markForDeletion', async (req, res, next) => {
    try {
        const {id} = req.params;
        const {newStatus} = req.body;
        if(newStatus == null) res.status(400).json({error: 'Bad request, newStatus is required.'})
        const result = await todoRepository.markForDeletion({id, newStatus});
        res.json(result);
    } catch(err) {
        next(err);
    }
});

router.delete('/todos/:id', async (req, res, next) => {
    try {
        const {id} = req.params;
        const result = await todoRepository.deleteTodo(id);
        res.json(result);
    } catch(err) {
        next(err);
    }
});

router.get('/todos/:id', async (req, res, next) => {
    try {
        const {id} = req.params;
        const result = await todoRepository.getById(id);
        res.json(result);
    } catch(err) {
        next(err);
    }
});

router.get('/todos', async (req, res, next) => {
    const {status} = req.query;
    const {userId} = req.user;
    try {
        const result = await todoRepository.getByStatus({userId, status});
        res.json(result);
    } catch(err) {
        next(err);
    }
});

router.use(errorHandler);


module.exports = router;