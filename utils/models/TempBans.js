const { Schema, model } = require('mongoose');

const TempBans = new Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    reason: { type: String, required: true },
    caseId: { type: Number, required: true },
    Date: { type: Date, required: true },
    endTime: { type: Number, required: true }
});

module.exports = model('TempBans', TempBans);