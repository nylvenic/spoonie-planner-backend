const express = require('express');
const router = express.Router();
const errorHandler = require('../utils/errorHandler.js');
const TodoRepository = require('../repositories/TodoRepository.js');
const todoRepository = new TodoRepository();

router.post('/todos/create', async (req, res) => {
    try {
        const data = req.body;
        const result = await todoRepository.quickCreate(data);
        res.json(result);
    } catch(err) {
        next(err);
    }
});

router.put('/todos/:id/complete', async (req, res) => {
    try {
        const {id} = req.params;
        const {newStatus} = req.body;
        if(!newStatus) res.status(400).json({error: 'Bad request, newStatus is required.'})
        const result = await todoRepository.setCompleted({id, newStatus});
        res.json(result);
    } catch(err) {
        next(err);
    }
});

router.put('/todos/:id/markForDeletion', async (req, res) => {
    try {
        const {id} = req.params;
        const {newStatus} = req.body;
        if(!newStatus) res.status(400).json({error: 'Bad request, newStatus is required.'})
        const result = await todoRepository.markForDeletion({id, newStatus});
        res.json(result);
    } catch(err) {
        next(err);
    }
});

router.delete('/todos/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const result = await todoRepository.delete(id);
        res.json(result);
    } catch(err) {
        next(err);
    }
});

router.get('/todos', async (req, res) => {
    const {status} = req.query;
    try {
        const result = await todoRepository.getByStatus(status);
        res.json({result});
    } catch(err) {
        next(err);
    }
});

router.use(errorHandler);


module.exports = router;