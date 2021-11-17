const BaseCommand = require('../../utils/structures/BaseCommand');
const { MessageEmbed } = require('discord.js');
const Infractions = require('../../utils/models/Infractions');
const moment = require('moment');
const { Menu } = require('discord.js-menu');
const { COLOR_TYPES } = require('../../utils/structures/Constants');
const _ = require('lodash');

module.exports = class InfractionsCommand extends BaseCommand {
  constructor() {
    super({
      name: 'infractions',
      description: 'Shows infractions for the user.',
      category: 'Moderation',
      accessableby: 'Moderators',
      usage: 'infractions [User]',
      aliases: ['inf', 'infraction'],
      userPermissions: ['MANAGE_MESSAGES'],
      cooldown: 5
    });
  }

  async run(client, message, args, util) {

    if(!args[0]) return message.channel.send('You must provide a user.');

    const user = util.resolveUser(args[0], client.users.cache) || await client.users.fetch(args[0]);
    if(!user) return message.channel.send('I couldn\'t find that user.');

    const userInfractions = await Infractions.find({ guildId: message.guild.id, userId: user.id });
    if(userInfractions.length <= 0) return message.channel.send('This user doesn\'t have any infractions.');
    const chunks = _.chunk(userInfractions, 5);
    const embeds = new Array();

    for (let i = 0; i < chunks.length; i++) {
      const infs = chunks[i];
      const embed = new MessageEmbed()
        .setAuthor(`${message.author.tag}'s infractions`, message.author.avatarURL({ dynamic: true }))
        .setColor(COLOR_TYPES.INFO);

      for (let j = 0; j < infs.length; j++) {
        const infraction = infs[j];
        const moderator = await client.users.fetch(infraction.moderatorId);
        embed.addField(`Infraction #${infraction.caseId}`, `Type: \`${infraction.action.toProperCase()}\`\nModerator: \`${moderator.tag} (${moderator.id})\`\nReason: \`${infraction.reason}\`\nDate: ${moment.utc(infraction.Date).format('L')}`);
      }

      embeds.push({
        name: `embed${i}`,
        content: embed,
        reactions: {
          '◀️': 'previous',
          '▶️': 'next',
          '❌': 'stop'
        }
      });
    }

    try {
      if (embeds.length <= 1) {
        await message.author.send(embeds[0].content);
      } else {
        console.log('here');
        const dm = await message.author.createDM();
        const menu = new Menu(dm, message.author.id, embeds, 120000);
        menu.start();
      }
    } catch (error) {
      null;
    }

    message.channel.send(`Direct messaged you ${user.username}'s infractions. If you haven't received them, make sure your DMs are open and run the command again.`);

  }
};