const Joi = require('joi');

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
            username: Joi.string()
                .alphanum()
                .min(4)
                .required()
                .messages({
                    'string.base': `"username" should be a type of 'text'`,
                    'string.empty': `"username" cannot be an empty field`,
                    'string.min': `"username" should have a minimum length of {#limit}`,
                    'any.required': `"username" is a required field`
                }),
            password: Joi.string()
                .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)
                .required()
                .messages({
                    'string.pattern.base': `"password" should contain at least one number, one letter and one special character and should be at least 8 characters long.`,
                    'any.required': `"password" is a required field`
                }),
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
