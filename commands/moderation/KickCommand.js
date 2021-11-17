const BaseCommand = require('../../utils/structures/BaseCommand');
const { MessageEmbed } = require('discord.js');
const { MODERATION_LOG_TYPE } = require('../../utils/structures/Constants');
const Infractions = require('../../utils/models/Infractions');

module.exports = class KickCommand extends BaseCommand {
  constructor() {
    super({
      name: 'kick',
      description: 'Kicks a member from the server.',
      category: 'Moderation',
      accessableby: 'Moderators',
      usage: 'kick [User] (Reason)',
      aliases: ['k'],
      userPermissions: ['KICK_MEMBERS'],
      botPermissions: ['KICK_MEMBERS'],
      cooldown: 5
    });
  }

  async run(client, message, args, util) {

    if(!args[0]) return message.channel.send('You must provide a user to kick.');

    const kickMember = util.resolveMember(args[0], message.guild.members.cache);
    if(!kickMember) return message.channel.send('I couldn\'t find that user.');
    if(kickMember.user.id === message.author.id) return message.channel.send('You cannot kick yourself.');

    let reason = args.slice(1).join(' ');
		if (!reason) reason = 'No reason given.';

		if (!kickMember.kickable) return message.channel.send('I cannot kick that user.');

		try {
      await kickMember.kick();
    } catch (error) {
      message.channel.send('Sorry, an error occured and I couldn\'t kick that user.');
      console.error(error);
    }

    const newInfraction = new Infractions({
      guildId: message.guild.id,
      userId: kickMember.user.id,
      action: 'kick',
      moderatorId: message.author.id,
      Date: new Date(),
      reason
    });

    await newInfraction.save();

    message.channel.send(`Successfully kicked ${kickMember.user.username}.`);

    const embed = new MessageEmbed()
      .setTitle('Notice')
      .setColor(MODERATION_LOG_TYPE.KICK.hex)
      .setDescription(`You have been kicked from ${message.guild.name} for **${reason}**.`)
      .setFooter(kickMember.user.username, kickMember.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

      kickMember.user.send(embed).catch(() => { }); // eslint-disable-line

  }
};