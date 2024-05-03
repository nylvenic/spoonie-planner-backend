module.exports = function errorHandler(err, req, res, next) {
    console.error(err); // Log the error for debugging purposes
    res.status(500).json({ error: 'An unexpected error occurred' }); // Send a 500 Internal Server Error response
}