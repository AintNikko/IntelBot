const BaseCommand = require('../../utils/structures/BaseCommand');
const { MessageEmbed } = require('discord.js');
const { MODERATION_LOG_TYPE } = require('../../utils/structures/Constants');
const Infractions = require('../../utils/models/Infractions');
const ms = require('ms');
const Mutes = require('../../utils/models/Mutes');

module.exports = class MuteCommand extends BaseCommand {
  constructor() {
    super({
      name: 'mute',
      description: 'Mutes a member for a certain amount of time.',
      category: 'Moderation',
      accessableby: 'Moderators',
      usage: 'mute [User] [Duration] (Reason)',
      aliases: ['tempmute'],
      userPermissions: ['MANAGE_ROLES'],
      botPermissions: ['MANAGE_ROLES'],
      cooldown: 5
    });
  }

  async run(client, message, args, util) {

    if (!args[0]) return message.channel.send('You must provide a user to mute.');
    const member = util.resolveMember(args[0], message.guild.members.cache);
    if (!member) return message.channel.send('I couldn\'t find that user, please make sure to type their full username/tag.');
    if(member.user.id === message.author.id) return message.channel.send('You cannot mute yourself.');
    const duration = ms(args[1]);
    if (!duration) return message.channel.send('You must provide a duration.');
    let reason = args.slice(2).join(' ');
    if (!reason) reason = 'No reason given.';
    const checkMuted = await isMuted(member.user, message.guild);

    if (checkMuted) return message.channel.send('That user is already muted.');
    let mutedRole = util.resolveRole('Muted', message.guild.roles.cache);
    if (!mutedRole) {
      try {
        mutedRole = await message.guild.roles.create({
          data: {
            name: 'Muted',
            color: '#808080'
          }
        });

        message.guild.channels.cache.forEach(async (channel) => {
            await channel.updateOverwrites(mutedRole, {
                SEND_MESSAGES: false,
                ADD_REACTIONS: false
            });
        });
      } catch (e) {
        console.error(e);
      }
    }

    try {
      await member.roles.add(mutedRole);
    } catch (error) {
      return message.channel.send('Sorry, I couldn\'t mute that user.');
    }

    const newInfraction = new Infractions({
      guildId: message.guild.id,
      userId: member.user.id,
      action: 'mute',
      moderatorId: message.author.id,
      Date: new Date(),
      reason,
    });

    await newInfraction.save();

    await new Mutes({
      guildId: message.guild.id,
      userId: member.user.id,
      reason,
      Date: new Date(),
      endTime: Date.now() + duration,
      caseId: newInfraction.caseId
    }).save();

    message.channel.send(`Successfully muted ${member.user.tag} for ${ms(duration, { long: true })}.`);
    const embed = new MessageEmbed()
      .setTitle('Notice')
      .setColor(MODERATION_LOG_TYPE.MUTE.hex)
      .setDescription(`You have been temporarily muted from ${message.guild.name} for **${reason}**. Your mute ends in ${ms(duration, { long: true })}.`)
      .setFooter(member.user.username, member.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    await member.user.send(embed).catch(() => { }); // eslint-disable-line

  }
};

async function isMuted(user, guild) {
    const mutedUser = await Mutes.findOne({ guildId: guild.id, UserId: user.id });
    if (!mutedUser) return false;
    else return true;
  }