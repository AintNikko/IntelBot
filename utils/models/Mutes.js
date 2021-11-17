const { Schema, model } = require('mongoose');

const mutes = new Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    reason: { type: String, default: 'No reason provided.' },
    caseId: { type: Number, required: true },
    Date: { type: Date, required: true },
    endTime: { type: Number, required: true },
});

module.exports = model('mutes', mutes);