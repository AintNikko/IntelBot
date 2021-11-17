const BaseCommand = require('../../utils/structures/BaseCommand');
const Mutes = require('../../utils/models/Mutes');

module.exports = class UnmuteCommand extends BaseCommand {
  constructor() {
    super({
      name: 'unmute',
      description: 'Unmutes a member.',
      category: 'Moderation',
      accessableby: 'Moderators',
      usage: 'unmute [User]',
      aliases: ['untempmute'],
      userPermissions: ['MANAGE_ROLES'],
      botPermissions: ['MANAGE_ROLES'],
      cooldown: 5
    });
  }

  async run(client, message, args, util) {

    if(!args[0]) return message.channel.send('You must provide a user to unmute.');
    const member = util.resolveMember(args.join(' '), message.guild.members.cache);
    const role = util.resolveRole('Muted', message.guild.roles.cache);
    if(!member) return message.channel.send('I couldn\'t find that user.');

    const mute = await Mutes.findOne({ guildId: message.guild.id, userId: member.user.id });
    if(!mute) return message.channel.send('That user isn\'t muted.');

    try {
      await member.roles.remove(role, 'Unmute command.');
      await mute.delete();
    } catch (error) {
      return message.channel.send('Sorry, I couldn\'t unmute that user.');
    }

    message.channel.send(`Successfully unmuted ${member.user.tag}.`);

  }
};