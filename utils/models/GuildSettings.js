const { Schema, model } = require('mongoose');

const GuildSettings = new Schema({
    guildId: { type: String, required: true, unique: true },
    prefix: { type: String, default: process.env.BOT_PREFIX },
    bindings: [{ roleId: String, rank: Number }],
    robloxGroup: { type: Number },
    verifiedRole: { type: String },
    staff: { type: [String] },
    infoAccess: { type: [String] },
    logging: { type: String },
    channel: { type: String }
});

module.exports = model('GuildSettings', GuildSettings);