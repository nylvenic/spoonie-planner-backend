module.exports = class User {
    constructor({username, password, email}) {
        if(!username) throw new Error('No username value.');
        if(!password) throw new Error('No password value.');
        if(!email) throw new Error('No email value.');
        this.username = username;
        this.password = password;
        this.email = email;
        this.nickname = username;
        this.avatar = '/avatars/default.jpg';
        this.todos;
        this.maxSpoons = 12;
        this.spoonCarryOver = false;
    }
}