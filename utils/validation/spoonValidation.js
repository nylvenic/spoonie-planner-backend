const Joi = require('joi');

module.exports = (name) => Joi.number()
    .greater(0)  // Ensures the number is greater than 0
    .required()  // Makes the field required
    .integer()   // Optionally ensure the number is an integer
    .messages({
        'number.base': `"${name}" must be a number`,
        'number.greater': `"${name}" must be greater than 0`,
        'number.integer': `"${name}" must be an integer`,
        'any.required': `"${name}" is a required field`
    });
