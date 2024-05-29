const User = require("../models/User.js");
const pool = require('../utils/database.js');
const bcrypt = require('bcrypt');
const createToken = require('../utils/createToken.js');
const CONSTANTS = require('../utils/constants.js');
const passwordValidation = require("../utils/validation/passwordValidation.js");
const Joi = require("joi");
const nicknameValidation = require("../utils/validation/nicknameValidation.js");
const spoonValidation = require("../utils/validation/spoonValidation.js");
const saltRounds = 10;
const SEARCHTYPES = {
    USERNAME: 'username',
    EMAIL: 'email',
    ID: 'id',
}
const fs = require('fs/promises');

function resHandling({msg, success}) {
    return {
        msg,
        success: success
    }
}

module.exports = class UserRepository {
    async create(data) {
        try {
            let user;
            try {
                user = new User({username: data.username, password: data.password, email: data.email});
            } catch(error) {
                return {msg: error.message, success: false}
            }
            const foundUsername = await this.findBy({type: SEARCHTYPES.USERNAME, value: data.username});
            if(foundUsername) {
                return resHandling(CONSTANTS.RESPONSES.USER.CREATE.USER_EXISTS);
            }
            const foundEmail = await this.findBy({type: SEARCHTYPES.EMAIL, value: data.email});
            if(foundEmail) {
                return resHandling(CONSTANTS.RESPONSES.USER.CREATE.EMAIL_EXISTS);
            }
            const hash = await bcrypt.hash(user.password, saltRounds);
            await pool.query(`INSERT INTO users (username, password, email, nickname) VALUES (?, ?, ?, ?);`, 
                [user.username, hash, user.email, user.username]);
            return resHandling(CONSTANTS.RESPONSES.USER.CREATE.SUCCESS);
        } catch (error) {
            console.error(error);
            return resHandling(CONSTANTS.RESPONSES.USER.CREATE.GENERIC_ERROR);
        }
    }

    async login(data) {
        try {
            const { username, password } = data;
            const result = await this.findBy({type: SEARCHTYPES.USERNAME, value: username});
            if (!result) {
                return resHandling(CONSTANTS.RESPONSES.GENERIC.USER_NOT_FOUND);
            }
            const user = result.user;
            const hash = user.password;
    
            const passwordMatch = await bcrypt.compare(password, hash);
            if (passwordMatch) {
                const token = createToken(user);
                return { ...resHandling(CONSTANTS.RESPONSES.USER.LOGIN.SUCCESS), token };
            } else {
                return resHandling(CONSTANTS.RESPONSES.USER.LOGIN.WRONG_PASSWORD);
            }
        } catch (error) {
            console.error(error);
            return resHandling(CONSTANTS.RESPONSES.USER.LOGIN.GENERIC_ERROR);
        }
    }
    
    async findBy({type, value}) {
        const validColumns = [SEARCHTYPES.USERNAME, SEARCHTYPES.EMAIL, SEARCHTYPES.ID];
        if (!validColumns.includes(type)) {
            throw new Error('Invalid search type');
        }
        const result = await pool.query(`SELECT * FROM users WHERE ${type} = ?`, [value]);
        if (!result[0] || result[0].length === 0) {
            return false;
        }
        return { user: result[0][0] };
    }    

    async changeSpoons({userId, cost, replenish, maxSpoons}) {
        try {
            const userData = await this.findBy({type: SEARCHTYPES.ID, value: userId});
            if (!userData) {
                return CONSTANTS.RESPONSES.GENERIC.USER_NOT_FOUND
            }

            const currentSpoons = userData.user.current_spoons;
            let newCurrentSpoons = replenish ? currentSpoons + cost : currentSpoons - cost;
            
            // Prevent negative spoon count
            if (newCurrentSpoons < 0) {
                newCurrentSpoons = 0;
            }

            // prevent spoon overload
            if(newCurrentSpoons > maxSpoons) {
                newCurrentSpoons = maxSpoons;
            }
    
            console.log(newCurrentSpoons, userId);
            const result = await pool.query(`UPDATE users SET current_spoons = ? WHERE id = ?`, [newCurrentSpoons, userId]);
            console.log(result);
    
            const successResponse = CONSTANTS.RESPONSES.USER.SPOONS_CHANGE.SUCCESS(userId);
            return {...resHandling(successResponse), newSpoons: newCurrentSpoons};
        } catch (error) {
            console.error(error);
            return resHandling(CONSTANTS.RESPONSES.USER.SPOONS_CHANGE.GENERIC_ERROR);
        }
    }    

    async getSpoons(userId) {
        try {
            const result = await pool.query(`SELECT max_spoons, current_spoons FROM users WHERE id = ?`, [userId]);
            const successResponse = CONSTANTS.RESPONSES.USER.SPOONS_GET.SUCCESS(userId);
            return {...resHandling(successResponse), result: result[0][0]};
        } catch(error) {
            console.error(error);
            return resHandling(CONSTANTS.RESPONSES.USER.SPOONS_GET.GENERIC_ERROR);
        }
    }

    async changePassword({userId, newPassword, oldPassword}) {
        try {
            const schema = Joi.object({
                password: passwordValidation
            });
            const {error, value} = schema.validate({password: newPassword}, {abortEarly: false});
            const {password} = value;
            if(error) {
                const msg = error.details[0].message;
                return resHandling({msg, success: false});
            }
            const {user} = await this.findBy({type: SEARCHTYPES.ID, value: userId});
            const hash = user.password;
            const passwordMatch = await bcrypt.compare(oldPassword, hash);
            if (passwordMatch) {
                const newHash = await bcrypt.hash(password, saltRounds);
                await pool.query(`UPDATE users SET password = ? WHERE id = ?`, [newHash, user.id]);
                return resHandling(CONSTANTS.RESPONSES.USER.PASSWORD_CHANGE.SUCCESS);
            } else {
                return resHandling(CONSTANTS.RESPONSES.USER.PASSWORD_CHANGE.WRONG_PASSWORD);
            }
        } catch(error) {
            console.error(error);
            return resHandling(CONSTANTS.RESPONSES.USER.PASSWORD_CHANGE.GENERIC_ERROR);
        }
    }

    async changeMaxSpoons({userId, newMaxSpoons}) {
        try {
            const schema = Joi.object({
                maxSpoons: spoonValidation('New Max Spoons')
            });
            const {error, value} = schema.validate({maxSpoons: newMaxSpoons}, {abortEarly: false});
            const {maxSpoons} = value;
            if(error) {
                const msg = error.details[0].message;
                return resHandling({msg, success: false});
            }
            const {user} = await this.findBy({type: SEARCHTYPES.ID, value: userId});
            await pool.query(`UPDATE users SET max_spoons = ? WHERE id = ?`, [newMaxSpoons, user.id]);
            const updatedUser = { ...user, max_spoons: newMaxSpoons};
            const token = createToken(updatedUser);
            return { ...resHandling(CONSTANTS.RESPONSES.USER.CHANGE_MAX_SPOONS.SUCCESS), token };
        } catch(error) {
            console.error(error);
            return resHandling(CONSTANTS.RESPONSES.USER.CHANGE_MAX_SPOONS.GENERIC_ERROR);
        }
    }

    async changeAvatar({userId, filename, previousAvatar}) {
        try {
            if (previousAvatar !== "/avatars/default.jpg") {
                const previousFilePath = `./public${previousAvatar}`; // Adjust the path as needed based on your server setup
                await fs.unlink(previousFilePath)
                      .catch(err => console.error('Failed to delete the previous avatar:', err));
            }
            const fullFilename = `/avatars/${filename}`;
            const {user} = await this.findBy({type: SEARCHTYPES.ID, value: userId});
            await pool.query(`UPDATE users SET avatar = ? WHERE id = ?`, [fullFilename, user.id]);
            const updatedUser = { ...user, avatar: fullFilename};
            const token = createToken(updatedUser);
            return { ...resHandling(CONSTANTS.RESPONSES.USER.AVATAR_CHANGE.SUCCESS), token };
        } catch(error) {
            console.error('Error changing avatar', error);
            return resHandling(CONSTANTS.RESPONSES.USER.AVATAR_CHANGE.GENERIC_ERROR);
        }
    }

    async changeNickname({userId, newNickname}) {
        try {
            const schema = Joi.object({
                nickname: nicknameValidation
            });
            const {error, value} = schema.validate({nickname: newNickname}, {abortEarly: false});
            const {nickname} = value;
            if(error) {
                const msg = error.details[0].message;
                return resHandling({msg, success: false});
            }
            const {user} = await this.findBy({type: SEARCHTYPES.ID, value: userId});
            await pool.query(`UPDATE users SET nickname = ? WHERE id = ?`, [nickname, user.id]);
            const updatedUser = { ...user, nickname};
            const token = createToken(updatedUser);
            return { ...resHandling(CONSTANTS.RESPONSES.USER.NICKNAME_CHANGE.SUCCESS), token };
        } catch(error) {
            console.error(error);
            return resHandling(CONSTANTS.RESPONSES.USER.NICKNAME_CHANGE.GENERIC_ERROR);
        }
    }

    async changeLastVisited({userId, newDate}) {
        try {
            const {user} = await this.findBy({type: SEARCHTYPES.ID, value: userId});
            if(!user) return resHandling(CONSTANTS.RESPONSES.GENERIC.USER_NOT_FOUND);
            await pool.query(`UPDATE users SET last_visited = ? WHERE id = ?`, [newDate, user.id]);
            const token = createToken({...user, last_visited: newDate})
            return { ...resHandling(CONSTANTS.RESPONSES.USER.CHANGE_LAST_VISITED.SUCCESS), token } 
        } catch(error) {
            console.error(error);
            return resHandling(CONSTANTS.RESPONSES.USER.CHANGE_LAST_VISITED.GENERIC_ERROR);
        }
    }

    async getLastVisited({userId}) {
        try {
            const result = await pool.query(`SELECT last_visited FROM users WHERE id = ?`, [userId]);
            const successResponse = CONSTANTS.RESPONSES.USER.GET_LAST_VISITED.SUCCESS;
            return {...resHandling(successResponse), result: result[0][0]};
        } catch(error) {
            console.error(error);
            return resHandling(CONSTANTS.RESPONSES.USER.GET_LAST_VISITED.GENERIC_ERROR);
        }
    }

    async changeBrowserReminders({userId, reminders}) {
        const {onTimeReminder, minuteReminder5, minuteReminder30, hourReminder1, dayReminder1} = reminders;
        try {
            const {user} = await this.findBy({type: SEARCHTYPES.ID, value: userId});
            await pool.query(`UPDATE users 
            SET on_time_reminder = ?, 
            5_min_reminder = ?,
            30_min_reminder = ?,
            1_hour_reminder = ?,
            1_day_reminder = ? 
            WHERE id = ?`, [onTimeReminder, minuteReminder5, minuteReminder30, hourReminder1, dayReminder1, user.id]);
            const updatedUser = { ...user, 
                "on_time_reminder": onTimeReminder,
                "5_min_reminder": minuteReminder5,
                "30_min_reminder": minuteReminder30,
                "1_hour_reminder": hourReminder1,
                "1_day_reminder": dayReminder1,
            };
            const token = createToken(updatedUser);
            return { ...resHandling(CONSTANTS.RESPONSES.USER.REMINDERS_CHANGE.SUCCESS), token };
        } catch(error) {
            console.error('Error changing reminders', error);
            return resHandling(CONSTANTS.RESPONSES.USER.REMINDERS_CHANGE.GENERIC_ERROR);
        }
    }
};