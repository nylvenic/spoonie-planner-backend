const CONSTANTS = require("./CONSTANTS.js");

module.exports = function errorHandler(err, req, res, next) {
    console.error(err); // Log the error for debugging purposes
    res.status(500).json(CONSTANTS.RESPONSES.GENERIC.ALL); // Send a 500 Internal Server Error response
}