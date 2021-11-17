const BaseCommand = require('../../utils/structures/BaseCommand');
const { MessageEmbed } = require('discord.js');
const { MODERATION_LOG_TYPE } = require('../../utils/structures/Constants');
const Infractions = require('../../utils/models/Infractions');

module.exports = class WarnCommand extends BaseCommand {
  constructor() {
    super({
      name: 'warn',
      description: 'Warns a user.',
      category: 'Moderation',
      accessableby: 'Moderators',
      usage: 'warn [User] (Reason)',
      aliases: [],
      userPermissions: ['MANAGE_MESSAGES'],
      cooldown: 5
    });
  }

  async run(client, message, args, util) {

    if (!args[0]) return message.channel.send('You must provide a user to warn.');

    const warnMember = util.resolveMember(args[0], message.guild.members.cache);
    if (!warnMember) return message.channel.send('I couldn\'t find that user.');

    let reason = args.slice(1).join(' ');
    if (!reason) reason = 'No reason given.';

    const newInfraction = new Infractions({
      guildId: message.guild.id,
      userId: warnMember.user.id,
      action: 'warn',
      moderatorId: message.author.id,
      reason,
      Date: new Date()
    });

    await newInfraction.save();

    message.channel.send(`Successfully warned ${warnMember.user.username}.`);
    const embed = new MessageEmbed()
      .setTitle('Notice')
      .setColor(MODERATION_LOG_TYPE.WARN.hex)
      .setDescription(`You have been warned in ${message.guild.name} for **${reason}**.`)
      .setFooter(warnMember.user.username, warnMember.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    warnMember.user.send(embed).catch(() => { }); // eslint-disable-line

  }
};