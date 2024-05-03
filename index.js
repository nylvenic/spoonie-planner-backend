require('dotenv').config();
const express = require('express');
const todoRoutes = require('./routes/todo.js');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(todoRoutes);
app.listen(PORT, () => {
    console.log(`App is listening on http://localhost:${PORT}`)
});