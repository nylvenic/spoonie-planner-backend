const pool = require('../utils/database.js');
const Todo = require('../models/Todo.js');
const CONSTANTS = require('../utils/constants.js');

module.exports = class TodoRepository {
    async quickCreate(data) {
        const todo = new Todo(data);
        await pool.query(`INSERT INTO ${CONSTANTS.TODO_TABLE} 
        (text, date, cost, repeat_task, replenish) 
        VALUES(?, ?, ?, ?, ?)`,
        [todo.text, todo.date, todo.cost, todo.repeat, todo.replenish]);
        return {msg: 'Successfully added:' + todo.toString()}
    }

    async setCompleted({id, newStatus}) {
        const [row, fields] = await pool.query(`UPDATE ${CONSTANTS.TODO_TABLE} SET completed=? WHERE id=?`, [newStatus, id]);
        console.log(row, fields);
        return {msg: `Successfully updated todo.`};
    }

    async markForDeletion({id, newStatus}) {
        const [row, fields] = await pool.query(`UPDATE ${CONSTANTS.TODO_TABLE} SET deleted=? WHERE id=?`, [newStatus, id]);
        console.log(row, fields);
        return {msg: `Successfully updated todo.`};
    }

    async deleteTodo(id) {
        const [row, fields] = await pool.query(`DELETE FROM ${CONSTANTS.TODO_TABLE} WHERE id=?`, [id]);
        console.log(row, fields);
        return {msg: `Successfully deleted todo.`};
    }

    async getAll() {
        const [row, fields] = await pool.query(`SELECT * FROM ${CONSTANTS.TODO_TABLE} WHERE completed=FALSE AND deleted=FALSE`);
        console.log(row, fields);
        return {msg: 'Successfully fetched all todos.'}
    }

    async getAllDeleted() {
        const [row, fields] = await pool.query(`SELECT * FROM ${CONSTANTS.TODO_TABLE} WHERE deleted=TRUE`);
        console.log(row, fields);
        return {msg: 'Successfully fetched all deleted todos.'};
    }

    async getAllCompleted() {
        const [row, fields] = await pool.query(`SELECT * FROM ${CONSTANTS.TODO_TABLE} WHERE completed=TRUE`);
        console.log(row, fields);
        return {msg: 'Successfully fetched all completed todos.'};
    }

    async getByStatus(status) {
        if(status == 'deleted') {
            return this.getAllDeleted();
        } else if(status == 'completed') {
            return this.getAllCompleted();
        } else {
            return this.getAll();
        }
    }
}