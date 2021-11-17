const { Client, Collection } = require('discord.js');
const GuildSettings = require('../models/GuildSettings');
const mongoose = require('mongoose');
const Prompt = require('ahmood-prompts');
const { promisify } = require('util');
const ExploiterManager = require('../managers/ExploiterManager');
const ScammerManager = require('../managers/ScammerManager');
/**
 * Class representing a Discord.js Client.
 * @param {ClientOptions} options Options for the client.
 */

module.exports = class DiscordClient extends Client {

	constructor(options) {
		super(options);

		this.commands = new Collection();
		this.events = new Collection();
		this.prefix = process.env.PREFIX;
		this.aliases = new Collection();
		this.wait = promisify(setTimeout);
		this.mongoose = require('./Database');
		this.prompt = new Prompt(this);
		this.managers = {
			exploiters: new ExploiterManager(this),
			scammers: new ScammerManager(this)
		}
		this.defaultSettings = {
			prefix: process.env.BOT_PREFIX,
		};
	}

	generateKey(length) {
		let result = '';
		const characters =
			'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		const charactersLength = characters.length;
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}

	async getGuild(guildId) {
		if (!guildId) return;
		const res = await GuildSettings.findOne({ guildId });

		if (res) return res;
	}

	async updateGuild(guildId, settings) {
		let data = await this.getGuild(guildId);

		if (typeof data !== 'object') data = {};
		Object.keys(settings).forEach(key => {
			if (data[key] !== settings[key]) data[key] = settings[key];
			else return;
		});

		console.log(`Guild "${guildId}" updated settings: ${Object.keys(settings)}`);
		return await data.updateOne(settings);
	}

	async makeGuild(settings) {
		const defaults = Object.assign({ _id: mongoose.Types.ObjectId() }, this.defaultSettings);
		const merged = Object.assign(defaults, settings);

		const newGuild = new GuildSettings(merged);
		return await newGuild.save();
	}

};