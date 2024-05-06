const User = require("../models/User.js");
const pool = require('../utils/database.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;
module.exports = class UserRepository {
    async create(data) {
        try {
            let user;
            try {
                user = new User({username: data.username, password: data.password, email: data.email});
            } catch(error) {
                return {error: error.message}
            }
            const foundUsername = await this.findByUsername(user.username);
            console.log(foundUsername);
            if(foundUsername) {
                return {error: 'This username already exists.'};
            }
            const foundEmail = await this.findByEmail(user.email);
            console.log(foundEmail);
            if(foundEmail) {
                return {error: 'This email already exists.'};
            }
            const hash = await bcrypt.hash(user.password, saltRounds);
            await pool.query(`INSERT INTO users (username, password, email, nickname) VALUES (?, ?, ?, ?);`, 
                [user.username, hash, user.email, user.username]);
            return {msg: 'Successfully created user.'};
        } catch (error) {
            console.error(error);
            return {error:'Something went wrong when creating user.'}
        }
    }

    async login(data) {
        try {
            const { username, password } = data;
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
                }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '3d' });
    
                return { msg: 'Successful authentication.', token };
            } else {
                return { msg: 'Invalid password.' };
            }
        } catch (error) {
            console.error(error);
            return { error: 'Something went wrong when logging in.' };
        }
    }
    

    async findByUsername(username) {
        try {
            const result = await pool.query(`SELECT * FROM users WHERE username = ?;`, [username]);
            const data = result[0][0];
            if(data) {
                console.log(data);
                return {msg: 'Successfully retrieved user.', user: data};
            } else {
                return false;
            }
        } catch(error) {
            console.error(error);
        }
    }

    async findByEmail(email) {
        try {
            const result = await pool.query('SELECT * FROM users WHERE email = ?;', [email]);
            const data = result[0][0];
            if(data) {
                console.log(data);
                return {msg: 'Successfully retrieved user by email.', user: data};
            } else {
                return false;
            }
        } catch (error) {
            console.error(error);
        }
    }
};