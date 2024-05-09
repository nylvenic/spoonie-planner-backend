const User = require("../models/User.js");
const pool = require('../utils/database.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;
const SEARCHTYPES = {
    USERNAME: 'username',
    EMAIL: 'email',
    ID: 'id',
}
module.exports = class UserRepository {
    async create(data) {
        try {
            let user;
            try {
                user = new User({username: data.username, password: data.password, email: data.email});
            } catch(error) {
                return {error: error.message}
            }
            const foundUsername = await this.findBy({type: SEARCHTYPES.USERNAME, value: data.username});
            if(foundUsername) {
                return {error: 'This username already exists.'};
            }
            const foundEmail = await this.findBy({type: SEARCHTYPES.EMAIL, value: data.email});
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
            const result = await this.findBy({type: SEARCHTYPES.USERNAME, value: username});
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
    
    async findBy({type, value}) {
        try {
            const result = await pool.query(`SELECT * FROM users WHERE ${type} = ?;`, [value]);
            const data = result[0][0];
            if(data) {
                console.log(data);
                return {msg: `Successfully retrieved user by ${type}.`, user: data};
            } else {
                return false;
            }
        } catch(error) {
            console.error(error);
        }
    }

    async changeSpoons({userId, cost, replenish}) {
        try {
            const userData = await this.findBy({type: SEARCHTYPES.ID, value: userId});
            const newCurrentSpoons = replenish ? userData.current_spoons + cost : userData.current_spoons - cost;
            const result = await pool.query(`UPDATE users SET current_spoons = ? WHERE id = ?`, [newCurrentSpoons, userId]);
            console.log(result);
            return {msg: `Successfully changed the spoons of ${userId}. New spoons: ${newCurrentSpoons}`};
        } catch(error) {
            console.error(error);
            return {error: 'Failed to update spoons.'};
        }
    }

    async getSpoons(userId) {
        try {
            const result = await pool.query(`SELECT max_spoons, current_spoons FROM users WHERE id = ?`, [userId]);
            return {msg: `Successfully obtained spoons for ${userId}.`, result: result[0][0]};
        } catch(error) {
            console.error(error);
            return {error: 'Failed to update spoons.'};
        }
    }
};