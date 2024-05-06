require('dotenv').config();
const express = require('express');
const todoRoutes = require('./routes/todo.js');
const userRoutes = require('./routes/user.js');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');
app.use(cors())
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(todoRoutes);
app.use(userRoutes);
app.listen(PORT, () => {
    console.log(`App is listening on http://localhost:${PORT}`)
});