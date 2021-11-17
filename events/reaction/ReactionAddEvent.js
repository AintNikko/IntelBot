const Pending = require('../../utils/models/Pending');
const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class ReactionAddEvent extends BaseEvent {
	constructor() {
		super('messageReactionAdd');
	}

	async run(client, reaction, user) {
		if (reaction.partial) await reaction.fetch();
		if (reaction.message.partial) await reaction.message.fetch();
		if (user.bot) return;
		await reaction.users.remove(user.id);

		const pending = await Pending.findOne({ messageId: reaction.message.id });
		if (!pending) return;
		const res = await client.getGuild(reaction.message.guild.id);
		if (!res.staff.includes(user.id)) return;

		switch (reaction.emoji.name) {
			case '✅': {
				if (!pending.pending) return;
				const channel = reaction.message.guild.channels.cache.get(res.logging);
				if (channel) {
					const msg = await channel.send(reaction.message.embeds[0]);
					await reaction.message.delete();
					await msg.react('🗑️');
					await pending.updateOne({ messageId: msg.id, pending: false });
				} else {
					await reaction.message.delete();
				await pending.updateOne({ pending: false });
				}
				pending.type === 'scammer' ? await client.managers.scammers.set(pending.robloxId, { evidence: pending.evidence, reason: pending.reason }) : await client.managers.exploiters.set(pending.robloxId, { evidence: pending.evidence, reason: pending.reason });
				break;
			}
			case '❌': {
				if (!pending.pending) return;
				await reaction.message.delete();
				await pending.delete();
				break;
			}
			case '🗑️': {
				if (pending.pending) return;
				const data = pending.type === 'scammer' ? await client.managers.scammers.get(pending.robloxId) : await client.managers.exploiters.get(pending.robloxId);
				await data.deleteOne();
				await pending.deleteOne();
				await reaction.message.delete();
				break;
			}
		}
	}
};