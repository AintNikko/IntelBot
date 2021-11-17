const { MessageEmbed } = require('discord.js');
const BaseCommand = require('../../utils/structures/BaseCommand');
const Infractions = require('../../utils/models/Infractions');
const { Menu } = require('discord.js-menu');
const _ = require('lodash');
const moment = require('moment');
const { COLOR_TYPES } = require('../../utils/structures/Constants');

module.exports = class MyinfractionsCommand extends BaseCommand {
  constructor() {
    super({
      name: 'myinfractions',
      description: 'Direct messages you your infractions.',
      category: 'miscellaneous',
      aliases: ['infractionsme', 'myinf', 'myinfraction']
    });
  }

  async run(client, message) {
    const infractions = await Infractions.find({ guildId: message.guild.id, userId: message.author.id });
    if (infractions.length <= 0) return message.channel.send('You don\'t have any infractions.');

    const chunks = _.chunk(infractions, 5);
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
        const dm = await message.author.createDM();
        const menu = new Menu(dm, message.author.id, embeds, 120000);
        menu.start();
      }
    } catch (error) {
      null;
    }

    message.channel.send('Direct messaged you your infractions. If you haven\'t received them, make sure your DMs are open and run the command again.');
  }
};
