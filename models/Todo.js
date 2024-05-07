const moment = require('moment');
module.exports = class Todo {
    constructor({text, description, date=Date.now(), cost=1, completed=false, repeat=false, replenish=false, userId}) {
        if(!text) throw new Error('Please provide a text string.');
        if(!userId) throw new Error('Please provide a user ID!');
        this.text = text;
        this.description = description;
        this.date = moment(date).unix();
        this.cost = cost;
        this.completed = completed;
        this.repeat = repeat;
        this.replenish = replenish;
        this.userId = userId;
    }

    toString() {
        return [`\nTEXT: ${this.text}`, 
        `DESCRIPTION: ${this.description}`, 
        `DATE: ${this.date}`, 
        `COST: ${this.cost}`, 
        `COMPLETED: ${this.completed}`, 
        `REPEAT: ${this.repeat}`, 
        `REPLENISH: ${this.replenish}`].join('\n');
    }
}