const { Schema, model } = require('mongoose');

const Scammers = new Schema({
    robloxId: { type: Number, required: true, unique: true },
    reason: { type: String, required: true, },
    evidence: { type: [String], required: true }
});

module.exports = model('Scammers', Scammers);