require('dotenv').config();
const express = require('express');
const todoRoutes = require('./routes/todo.js');
const userRoutes = require('./routes/user.js');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');
const CONSTANTS = require('./utils/constants.js');
// Define the options for CORS
const corsOptions = {
    origin: function (origin, callback) {
        // Add logic to allow specific origins or allow all if needed
        const allowedOrigins = ['http://localhost:3000', 'http://api.spoonietodo.com', 'http://spoonietodo.com'];
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
        } else {
        callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
// Use CORS with options
app.use(cors(corsOptions));
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