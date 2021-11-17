const BaseCommand = require('../../utils/structures/BaseCommand');
const RobloxUsers = require('../../utils/models/RobloxUsers');
const nbx = require('noblox.js');

module.exports = class ForcelinkCommand extends BaseCommand {
  constructor() {
    super({
      name: 'forcelink',
      description: 'Forces link a ROBLOX account to a Discord account.',
      ownerOnly: true,
      category: 'owner',
      accessableby: 'Bot owner',
      aliases: ['force-link']
    });
  }

  async run(client, message, args, util) {

    if(!args[0] || (args[0] && !args[1])) return message.channel.send('Incorrect usage.');

    const user = util.resolveUser(args[0], client.users.cache) || await client.users.fetch(args[0]);

    const userId = await nbx.getIdFromUsername(args[1]).catch(() => null);
		if(!userId) return message.channel.send('That user does not exist.');

    const res = await RobloxUsers.findOne({ discordId: user.id });

    if(res) {
        await res.updateOne({ discordId: user.id, robloxId: userId });
    } else {

    await new RobloxUsers({
        discordId: user.id,
        robloxId: userId
    }).save();
}

    message.channel.send(`Successfully force linked **${user.tag}** [${user.id}] with **${args[1]}** [${userId}]`);

  }
};