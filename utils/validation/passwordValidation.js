const Joi = require('joi');
module.exports = Joi.string()
.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)
.required()
.messages({
    'string.pattern.base': `"password" should contain at least one number, one letter and one special character and should be at least 8 characters long.`,
    'any.required': `"password" is a required field`
});