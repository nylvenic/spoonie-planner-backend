const jwt = require('jsonwebtoken');

module.exports = (user) => {
    const token = jwt.sign({
        userId: user.id,
        signedIn: true,
        username: user.username,
        maxSpoons: user.max_spoons,
        spoonCarryOver: user.spoon_carry_over,
        avatar: user.avatar,
        nickname: user.nickname,
        reminderOnTime: user['on_time_reminder'],
        reminderMin5: user['5_min_reminder'],
        reminderMin30: user['30_min_reminder'],
        reminderHour1: user['1_hour_reminder'],
        reminderDay1: user['1_day_reminder'],
    }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '3d' });
    return token;
}