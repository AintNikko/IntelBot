const BaseCommand = require('../../utils/structures/BaseCommand');
const Infractions = require('../../utils/models/Infractions');

module.exports = class RemoveInfractionCommand extends BaseCommand {
  constructor() {
    super({
      name: 'removeinfraction',
      description: 'Removes an infraction from the user.',
      category: 'Moderation',
      accessableby: 'Moderators',
      usage: 'removeinfraction [User] [Infraction ID]',
      aliases: ['ri', 'removeinf'],
      userPermissions: ['MANAGE_MESSAGES'],
      cooldown: 5
    });
  }

  async run(client, message, args, util) {

    if(!args[0]) return message.channel.send('You must provide a user.');

    const user = util.resolveUser(args[0], client.users.cache) || await client.users.fetch(args[0]);
    if(!user) return message.channel.send('I couldn\'t find that user');

    const infractions = args[1].split(',') || args[1];

    if(infractions[0].toLowerCase() === 'all') {
     await Infractions.deleteMany({ guildId: message.guild.id, userId: user.id });

      message.channel.send(`Successfully removed **all** infractions for ${user.tag}.`);
    } else if(infractions.length > 1) {
      const msg = await message.channel.send('Removing infractions...');
      for (let i = 0; i < infractions.length; i++) {
        await Infractions.findOneAndDelete({ guildId: message.guild.id, caseId: infractions[i] });
        await client.wait(1000);
      }
      msg.edit(`Successfully removed the infractions ${infractions.map(c => c).join(', ')} from ${user.tag}.`);
    } else if(!isNaN(Number(args[1]))) {
      await Infractions.findOneAndDelete({ guildId: message.guild.id, userId: user.id, caseId: Number(args[1]) });

      message.channel.send(`Successfully removed the infraction from ${user.username}.`);
    }

  }
};