const Joi = require('joi');
const moment = require('moment');

module.exports = class Todo {
    constructor({ text, description, date = null, cost = 1, completed = false, repeat = false, replenish = false, userId }) {
        console.log('BEFORE', date);
        const { value, error } = this.validateTodo({ text, description, date, cost, completed, repeat, replenish, userId });
        console.log('AFTER', value.date);
        if (error) {
            throw new Error(error.details[0].message);
        }
        
        this.text = value.text; // alphanumeric characters + symbols
        this.description = value.description; // alphanumeric characters + symbols
        this.date = value.date; // unix timestamp
        this.cost = value.cost; // number between 1 and 5 
        this.completed = value.completed;
        this.repeat = value.repeat; // true or false
        this.replenish = value.replenish; // true or false 
        this.userId = value.userId; 
    }

    validateTodo(data) {
        const schema = Joi.object({
            text: Joi.string().trim().required().messages({
                'any.required': 'Please provide a text string.',
            }),
            description: Joi.string().allow('').trim(),
            date: Joi.number().integer().min(0).required().messages({
                'number.base': 'Invalid date format, must be a valid Unix timestamp.',
                'number.integer': 'Invalid date format, must be an integer Unix timestamp.',
                'number.min': 'Invalid date, Unix timestamp cannot be negative.',
                'any.required': 'Date is required.'
            }),
            cost: Joi.number().integer().min(1).max(5).default(1).messages({
                'number.min': 'Cost must be at least 1.',
                'number.max': 'Cost must be at most 5.',
            }),
            completed: Joi.boolean().default(false),
            repeat: Joi.boolean().default(false),
            replenish: Joi.boolean().default(false),
            userId: Joi.number().integer().required().messages({
                'any.required': 'Please provide a user ID!',
            }),
        });

        return schema.validate(data, { abortEarly: false });
    }

    toString() {
        return [
            `\nTEXT: ${this.text}`,
            `DESCRIPTION: ${this.description}`,
            `DATE: ${this.date}`,
            `COST: ${this.cost}`,
            `COMPLETED: ${this.completed}`,
            `REPEAT: ${this.repeat}`,
            `REPLENISH: ${this.replenish}`
        ].join('\n');
    }
}
