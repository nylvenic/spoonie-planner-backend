require('dotenv').config();
const express = require('express');
const todoRoutes = require('./routes/todo.js');
const userRoutes = require('./routes/user.js');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');
const CONSTANTS = require('./utils/CONSTANTS.js');
app.use(cors())
app.use(express.static('public'));
app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({extended: false}));
app.use(todoRoutes);
app.use(userRoutes);
// Add this middleware after all your routes
app.use((req, res, next) => {
    res.status(404).send(CONSTANTS.RESPONSES.GENERIC.PAGE_NOT_FOUND);
});
app.listen(PORT, '::', () => {
    console.log(`App is listening on http://localhost:${PORT}`)
});