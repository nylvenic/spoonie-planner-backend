const express = require('express');
const router = express.Router();
const errorHandler = require('../utils/errorHandler.js');
const TodoRepository = require('../repositories/TodoRepository.js');
const todoRepository = new TodoRepository();
const jwt = require('jsonwebtoken');
const authMiddleware = require('../utils/middleware/authMiddleware.js');

router.use('/users/:userId/todos', authMiddleware);

router.post('/users/:userId/todos/create', authMiddleware, async (req, res, next) => {
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

router.put('/users/:userId/todos/:id', authMiddleware, async (req, res, next) => {
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

router.put('/users/:userId/todos/:id/complete', authMiddleware, async (req, res, next) => {
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

router.put('/users/:userId/todos/:id/markForDeletion', authMiddleware, async (req, res, next) => {
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

router.put('/users/:userId/todos/:id/set-reminded-state', authMiddleware, async (req, res, next) => {
    try {
        const {id} = req.params;
        const {reminders} = req.body;
        console.log(reminders);
        const result = await todoRepository.setRemindedState({id, reminders});
        res.json(result);
    } catch(err) {
        next(err);
    }
});

router.delete('/users/:userId/todos/:id', authMiddleware, async (req, res, next) => {
    try {
        const {id} = req.params;
        const result = await todoRepository.deleteTodo(id);
        res.json(result);
    } catch(err) {
        next(err);
    }
});

router.get('/users/:userId/todos/:id', authMiddleware, async (req, res, next) => {
    try {
        const {id} = req.params;
        const result = await todoRepository.getById(id);
        res.json(result);
    } catch(err) {
        next(err);
    }
});

router.get('/users/:userId/todos', authMiddleware, async (req, res, next) => {
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