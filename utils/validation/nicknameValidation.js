const Joi = require('joi');
module.exports = Joi.string()
.alphanum()
.min(1)
.required()
.messages({
    'string.base': `"nickname" should be a type of 'text'`,
    'string.empty': `"nickname" cannot be an empty field`,
    'string.min': `"nickname" should have a minimum length of {#limit}`,
    'any.required': `"nickname" is a required field`
});