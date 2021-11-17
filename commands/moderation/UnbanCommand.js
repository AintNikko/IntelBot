const BaseCommand = require('../../utils/structures/BaseCommand');

module.exports = class UnbanCommand extends BaseCommand {
  constructor() {
    super({
      name: 'unban',
      description: 'Removes a ban from the server.',
      category: 'Moderation',
      accessableby: 'Administrators',
      usage: 'unban [User]',
      aliases: ['removeban'],
      userPermissions: ['BAN_MEMBERS'],
      botPermissions: ['BAN_MEMBERS'],
      cooldown: 5
    });
  }

  async run(client, message, args) {

    if(!args[0]) return message.channel.send('You must provide a user ID to unban.');
    const bans = await message.guild.fetchBans();
    if(!bans.find(c => c.user.id === args[0])) return message.channel.send('That user is not currently banned.');
    const bannedUser = bans.get(args[0]);
    try {
      await message.guild.members.unban(bannedUser.user.id);
    } catch (error) {
      console.error(error);
    }

    message.channel.send(`Successfully unbanned ${bannedUser.user.tag}.`);

  }
};