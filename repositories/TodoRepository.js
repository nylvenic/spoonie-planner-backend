const pool = require('../utils/database.js');
const Todo = require('../models/Todo.js');
const CONSTANTS = require('../utils/constants.js');
const resHandling = require('../utils/resHandling.js');

module.exports = class TodoRepository {
    async create(data) {
        try {
            let todo;
            try {
                todo = new Todo(data);
            } catch (error) {
                console.error(error);
                return resHandling(CONSTANTS.RESPONSES.TODO.CREATE.VALIDATION(error.message));
            }
    
            const query = `INSERT INTO ${CONSTANTS.TODO_TABLE} 
                           (text, date, cost, repeat_task, replenish, description, user_id) 
                           VALUES (?, ?, ?, ?, ?, ?, ?);`;
    
            const params = [todo.text, todo.date, todo.cost, todo.repeat, todo.replenish, todo.description, todo.userId];
    
            const result = await pool.query(query, params);
    
            // Assuming the database returns an auto-incremented ID
            const insertedId = result.insertId;
    
            return { ...resHandling(CONSTANTS.RESPONSES.TODO.CREATE.SUCCESS), id: insertedId };
        } catch (error) {
            console.error(error);
            return resHandling(CONSTANTS.RESPONSES.TODO.CREATE.GENERIC_ERROR);
        }
    }
    
    async getById(id) {
        try {
            const query = `SELECT * FROM ${CONSTANTS.TODO_TABLE} WHERE id = ?;`;
            const result = await pool.query(query, [id]);
    
            // Assuming the first element is the required todo record
            const data = result[0];
    
            if (data) {
                return { ...resHandling(CONSTANTS.RESPONSES.TODO.GET_BY_ID.SUCCESS), todo: data };
            } else {
                return resHandling(CONSTANTS.RESPONSES.TODO.GET_BY_ID.TODO_NOT_FOUND);
            }
        } catch (error) {
            console.error(error);
            return resHandling(CONSTANTS.RESPONSES.TODO.GET_BY_ID.GENERIC_ERROR);
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
    
            return resHandling(CONSTANTS.RESPONSES.TODO.UPDATE.SUCCESS);
        } catch (error) {
            console.error(error);
            return resHandling(CONSTANTS.RESPONSES.TODO.UPDATE.GENERIC_ERROR);
        }
    }

    async setCompleted({id, newStatus}) {
        try {
            const result = await pool.query(`UPDATE ${CONSTANTS.TODO_TABLE} SET completed=? WHERE id=?;`, [newStatus, id]);
            console.log(result);
            return resHandling(CONSTANTS.RESPONSES.TODO.UPDATE.SUCCESS);
        } catch (error) {
            console.error(error);
            return resHandling(CONSTANTS.RESPONSES.TODO.UPDATE.GENERIC_ERROR);
        }
    }

    async markForDeletion({id, newStatus}) {
        try {
            const result = await pool.query(`UPDATE ${CONSTANTS.TODO_TABLE} SET deleted=? WHERE id=?;`, [newStatus, id]);
            console.log(result);
            return resHandling(CONSTANTS.RESPONSES.TODO.UPDATE.SUCCESS);
        } catch(error) {
            console.error(error);
            return resHandling(CONSTANTS.RESPONSES.TODO.UPDATE.GENERIC_ERROR);
        }
    }

    async deleteTodo(id) {
        try {
            const result = await pool.query(`DELETE FROM ${CONSTANTS.TODO_TABLE} WHERE id=?;`, [id]);
            console.log(result);
            return resHandling(CONSTANTS.RESPONSES.TODO.DELETE.SUCCESS);
        } catch(error) {
            console.error(error);
            return resHandling(CONSTANTS.RESPONSES.TODO.DELETE.GENERIC_ERROR);
        }
    }

    async getAll(userId) {
        const result = await pool.query(`SELECT * FROM ${CONSTANTS.TODO_TABLE} WHERE completed=FALSE AND deleted=FALSE AND user_id=?;`, [userId]);
        const data = result[0];
        if(data) {
            return {...resHandling(CONSTANTS.RESPONSES.TODO.GET_ALL.SUCCESS('inbox')), todos: data}
        } else {
            return resHandling(CONSTANTS.RESPONSES.TODO.GET_ALL.SUCCESS('inbox'));
        }
    }

    async setRemindedState({id, reminders}) {
        const {onTimeReminder, minuteReminder5, minuteReminder30, hourReminder1, dayReminder1} = reminders;
        try {
            await pool.query(`UPDATE todos 
                SET on_time_reminder = ?, 
                5_min_reminder = ?,
                30_min_reminder = ?,
                1_hour_reminder = ?,
                1_day_reminder = ? 
                WHERE id = ?`, [onTimeReminder, minuteReminder5, minuteReminder30, hourReminder1, dayReminder1, id]);
            return resHandling(CONSTANTS.RESPONSES.TODO.UPDATE.SUCCESS);
        } catch(error) {
            console.error(error);
            return resHandling(CONSTANTS.RESPONSES.TODO.UPDATE.GENERIC_ERROR);
        }
    }

    async getDailyTodos(userId) {
        // Get the start and end of the current day in UNIX timestamp format
        const startOfDay = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
        const endOfDay = Math.floor(new Date().setHours(23, 59, 59, 999) / 1000);
    
        // Query the database to fetch todos within the start and end of the day
        const result = await pool.query(`SELECT * FROM ${CONSTANTS.TODO_TABLE} WHERE completed=FALSE AND deleted=FALSE AND user_id=? AND date >= ? AND date <= ?;`, [userId, startOfDay, endOfDay]);
        const data = result[0];
        
        if (data) {
            return {...resHandling(CONSTANTS.RESPONSES.TODO.GET_ALL.SUCCESS('daily')), todos: data };
        } else {
            return resHandling(CONSTANTS.RESPONSES.TODO.GET_ALL.SUCCESS('daily'));
        }
    }
    

    async getAllDeleted(userId) {
        const result = await pool.query(`SELECT * FROM ${CONSTANTS.TODO_TABLE} WHERE deleted=TRUE AND user_id=?;`, [userId]);
        const data = result[0];
        if(data) {
            return {...resHandling(CONSTANTS.RESPONSES.TODO.GET_ALL.SUCCESS('deleted')), todos: data}
        } else {
            return resHandling(CONSTANTS.RESPONSES.TODO.GET_ALL.SUCCESS('deleted'));
        }
    }

    async getAllCompleted(userId) {
        const result = await pool.query(`SELECT * FROM ${CONSTANTS.TODO_TABLE} WHERE completed=TRUE AND user_id=?;`, [userId]);
        const data = result[0];
        if(data) {
            return {...resHandling(CONSTANTS.RESPONSES.TODO.GET_ALL.SUCCESS('completed')), todos: data}
        } else {
            return resHandling(CONSTANTS.RESPONSES.TODO.GET_ALL.SUCCESS('completed'));
        }
    }

    async getByStatus({status, userId}) {
        if (status === 'deleted') {
            return this.getAllDeleted(userId);
        } else if (status === 'completed') {
            return this.getAllCompleted(userId);
        } else if (status === 'today') {
            return this.getDailyTodos(userId);
        } else {
            return this.getAll(userId);
        }
    }    
}