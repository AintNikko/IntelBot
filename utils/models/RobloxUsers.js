const { Schema, model } = require('mongoose');

const RobloxUsers = new Schema({
    discordId: { type: String, required: true },
    robloxId: { type: Number, required: true }
});

module.exports = model('RobloxUsers', RobloxUsers);