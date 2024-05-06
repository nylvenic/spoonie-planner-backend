const User = require("../models/User.js");
const pool = require('../utils/database.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;
module.exports = class UserRepository {
    async create(data) {
        const user = new User({username: data.username, password: data.password, email: data.email});
        try {
            const hash = await bcrypt.hash(user.password, saltRounds);
            const result = await pool.query(`INSERT INTO users (username, password, email, nickname) VALUES (?, ?, ?, ?);`, 
                [user.username, hash, user.email, user.username]);
            return {msg: 'Successfully created user.', result};
        } catch (error) {
            return {error}
        }
    }

    async login(data) {
        const { username, password } = data;
        try {
            const result = await this.findByUsername(username);
            if (!result) {
                return { msg: 'User not found.' };
            }
            const user = result.user;
            const hash = user.password;
    
            const passwordMatch = await bcrypt.compare(password, hash);
            if (passwordMatch) {
                const token = jwt.sign({
                    userId: user.id,
                    signedIn: true,
                    username: user.username,
                    maxSpoons: user.max_spoons,
                    spoonCarryOver: user.spoon_carry_over,
                    avatar: user.avatar
                }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '7d' });
    
                return { msg: 'Successful authentication.', token };
            } else {
                return { msg: 'Invalid password.' };
            }
        } catch (error) {
            console.error(error);
            return { error: error.message || 'Something went wrong.' };
        }
    }
    

    async findByUsername(username) {
        const result = await pool.query(`SELECT * FROM users WHERE username = ?;`, [username]);
        return {msg: 'Successfully retrieved user.', user: result[0][0]};
    }
};