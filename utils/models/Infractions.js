const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const Infractions = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    action: { type: String, required: true },
    moderatorId: { type: String, required: true },
    reason: { type: String, default: 'No reason provided.' },
    caseId: { type: Number },
    Date: { type: Date, required: true }
});

Infractions.plugin(AutoIncrement, { id: 'infractions_seq', inc_field: 'caseId', reference_fields: ['guildId'] });

module.exports = mongoose.model('Infractions', Infractions);