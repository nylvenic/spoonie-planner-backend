const Joi = require('joi');
module.exports = Joi.string()
.alphanum()
.min(4)
.required()
.messages({
    'string.base': `"username" should be a type of 'text'`,
    'string.empty': `"username" cannot be an empty field`,
    'string.min': `"username" should have a minimum length of {#limit}`,
    'any.required': `"username" is a required field`
});