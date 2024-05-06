const Joi = require('joi');

module.exports = class User {
    constructor({ username, password, email }) {
        const { error, value } = this.validateUser({ username, password, email });
        if (error) {
            throw new Error(error.details[0].message);
        }

        this.username = value.username;
        this.password = value.password;
        this.email = value.email;
        this.nickname = value.username; // assuming nickname is the same as username
        this.avatar = '/avatars/default.jpg'; // default value for all users
        this.todos = [];
        this.maxSpoons = 12;
        this.spoonCarryOver = false;
    }

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
                .min(8)
                .required()
                .messages({
                    'string.pattern.base': `"password" should contain at least one number, one letter and one special character.`,
                    'string.min': `"password" should have a minimum length of {#limit}`,
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

        return schema.validate(data, { abortEarly: false });
    }
}
