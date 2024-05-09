const pool = require('../utils/database.js');
const Todo = require('../models/Todo.js');
const CONSTANTS = require('../utils/constants.js');

module.exports = class TodoRepository {
    async create(data) {
        try {
            let todo;
            try {
                todo = new Todo(data);
            } catch (error) {
                console.error(error);
                return { error: error.message };
            }
    
            const query = `INSERT INTO ${CONSTANTS.TODO_TABLE} 
                           (text, date, cost, repeat_task, replenish, description, user_id) 
                           VALUES (?, ?, ?, ?, ?, ?, ?);`;
    
            const params = [todo.text, todo.date, todo.cost, todo.repeat, todo.replenish, todo.description, todo.userId];
    
            const result = await pool.query(query, params);
    
            // Assuming the database returns an auto-incremented ID
            const insertedId = result.insertId;
    
            return { msg: 'Successfully added: ' + todo.toString(), id: insertedId };
        } catch (error) {
            console.error(error);
            return { error: 'Something went wrong when creating the todo.' };
        }
    }
    
    async getById(id) {
        try {
            const query = `SELECT * FROM ${CONSTANTS.TODO_TABLE} WHERE id = ?;`;
            const result = await pool.query(query, [id]);
    
            // Assuming the first element is the required todo record
            const data = result[0];
    
            if (data) {
                return { msg: 'Successfully fetched todo.', todo: data };
            } else {
                return { msg: 'No todo with such id found.' };
            }
        } catch (error) {
            console.error(error);
            return { error: 'Something went wrong when fetching the todo by ID.' };
        }
    }    

    async update({ data, id }) {
        try {
            let todo;
            try {
                todo = new Todo(data);
            } catch (error) {
                console.error(error);
                return { error: error.message };
            }
    
            const query = `UPDATE ${CONSTANTS.TODO_TABLE} 
                           SET text = ?, date = ?, cost = ?, repeat_task = ?, replenish = ?, description = ?, user_id = ? 
                           WHERE id = ?;`;
    
            const params = [todo.text, todo.date, todo.cost, todo.repeat, todo.replenish, todo.description, todo.userId, id];
    
            await pool.query(query, params);
    
            return { msg: 'Successfully updated: ' + todo.toString() };
        } catch (error) {
            console.error(error);
            return { error: 'Something went wrong when updating the todo.' };
        }
    }
    

    async setCompleted({id, newStatus}) {
        const result = await pool.query(`UPDATE ${CONSTANTS.TODO_TABLE} SET completed=? WHERE id=?;`, [newStatus, id]);
        console.log(result);
        return {msg: `Successfully updated todo.`};
    }

    async markForDeletion({id, newStatus}) {
        const [row, fields] = await pool.query(`UPDATE ${CONSTANTS.TODO_TABLE} SET deleted=? WHERE id=?;`, [newStatus, id]);
        console.log(row, fields);
        return {msg: `Successfully updated todo.`};
    }

    async deleteTodo(id) {
        const [row, fields] = await pool.query(`DELETE FROM ${CONSTANTS.TODO_TABLE} WHERE id=?;`, [id]);
        console.log(row, fields);
        return {msg: `Successfully deleted todo.`};
    }

    async getAll(userId) {
        const result = await pool.query(`SELECT * FROM ${CONSTANTS.TODO_TABLE} WHERE completed=FALSE AND deleted=FALSE AND user_id=?;`, [userId]);
        const data = result[0];
        if(data) {
            return {msg: 'Successfully fetched all todos.', todos: data}
        } else {
            return {msg: 'No todos found.'};
        }
    }

    async getAllDeleted(userId) {
        const result = await pool.query(`SELECT * FROM ${CONSTANTS.TODO_TABLE} WHERE deleted=TRUE AND user_id=?;`, [userId]);
        const data = result[0];
        if(data) {
            return {msg: 'Successfully fetched all deleted todos.', todos: data}
        } else {
            return {msg: 'No deleted todos found.'};
        }
    }

    async getAllCompleted(userId) {
        const result = await pool.query(`SELECT * FROM ${CONSTANTS.TODO_TABLE} WHERE completed=TRUE AND user_id=?;`, [userId]);
        const data = result[0];
        if(data) {
            return {msg: 'Successfully fetched all completed todos.', todos: data}
        } else {
            return {msg: 'No deleted todos found.'};
        }
    }

    async getByStatus({status, userId}) {
        if(status == 'deleted') {
            return this.getAllDeleted(userId);
        } else if(status == 'completed') {
            return this.getAllCompleted(userId);
        } else {
            return this.getAll(userId);
        }
    }
}