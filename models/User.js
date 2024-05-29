const Joi = require('joi');
const passwordValidation = require('../utils/validation/passwordValidation.js');
const usernameValidation = require('../utils/validation/usernameValidation.js');

module.exports = class User {
    constructor({ username, password, email }) {
        // Validate user input
        const { error, value } = this.validateUser({ username, password, email });
        
        // If there's an error in validation, throw it
        if (error) {
            throw new Error(error.details[0].message);
        }

        // Assign validated values to instance properties
        this.username = value.username;
        this.password = value.password;
        this.email = value.email;

        // Initialize other properties with default values
        this.nickname = value.username; // Nickname defaults to username
        this.avatar = '/avatars/default.jpg'; // Default avatar
        this.todos = []; // Initialize with an empty todo list
        this.maxSpoons = 12; // Default max spoons
        this.spoonCarryOver = false; // Default carry over status
    }

    // Validate user input using Joi schema
    validateUser(data) {
        const schema = Joi.object({
            username: usernameValidation,
            password: passwordValidation,
            email: Joi.string()
                .email({ minDomainSegments: 2 })
                .required()
                .messages({
                    'string.email': `"email" must be a valid email`,
                    'any.required': `"email" is a required field`
                })
        });

        // Validate data and return results
        return schema.validate(data, { abortEarly: false });
    }
}
