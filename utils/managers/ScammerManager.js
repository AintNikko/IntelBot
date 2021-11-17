const Scammers = require('../models/Scammers');

module.exports = class ScammerManager {
    constructor(client) {
        this.client = client;
    }

    async get(robloxId) {
        const data = await Scammers.findOne({ robloxId });
        if (!data) return null;
        return data;
    }

    async set(robloxId, newData = {}) {
        const data = await this.get(robloxId);
        if (data) {
            return await data.updateOne(newData);
        } else {
            const updated = Object.assign(newData, { robloxId });
            return await new Scammers(updated).save();
        }
    }

    async addEvidence(robloxId, evidence) {
        const data = await this.get(robloxId);
        if (!data) return null;
        return await data.updateOne({ $push: { evidence: evidence } });
    }
};