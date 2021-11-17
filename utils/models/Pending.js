const { Schema, model } = require('mongoose');

const Pending = new Schema({
    robloxId: { type: Number, required: true },
    type: { type: String, enum: ['scammer', 'exploiter'] },
    messageId: { type: String, required: true },
    reason: { type: String, required: true, },
    evidence: { type: [String], required: true },
    pending: { type: Boolean, default: true }
});

module.exports = model('Pending', Pending);