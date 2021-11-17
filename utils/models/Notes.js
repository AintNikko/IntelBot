const { Schema, model } = require('mongoose');

const Notes = new Schema({
	robloxId: { type: Number, required: true },
	note: { type: String, required: true }
});

module.exports = model('Notes', Notes);