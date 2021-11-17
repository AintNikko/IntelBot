const { Schema, model } = require('mongoose');

const Blacklists = new Schema({
    robloxId: { type: Number, required: true, unqieu: true },
    reason: { type: String, default: 'No reason given.' }
});

module.exports = model('Blacklists', Blacklists);