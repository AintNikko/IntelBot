const { MODERATION_LOG_TYPE } = require('../../utils/structures/Constants');

const { MessageEmbed } = require('discord.js');
const BaseCommand = require('../../utils/structures/BaseCommand');
const TempBans = require('../../utils/models/TempBans');
const Infractions = require('../../utils/models/Infractions');
const ms = require('ms');
require('moment-timezone');

module.exports = class BanCommand extends BaseCommand {
  constructor() {
    super({
      name: 'ban',
      category: 'Moderation',
      aliases: ['permban', 'tempban', 'softban'],
      description: 'Bans a member from the server temporarily or permenantly.',
      usage: 'ban [User] [perm/temp] [(duration)] (Reason)',
      userPermissions: ['BAN_MEMBERS'],
      botPermissions: ['BAN_MEMBERS'],
      examples: ['ban @ahmood#0001 perm breaking rules', 'ban ahmood temp 24h bye'],
      accessableby: 'Administrators',
      guildOnly: true
    });
  }

  async run(client, message, args, util) {

    if (!args[0]) return message.channel.send(`You must provide a user to ban. \`/${this.usage}\``);
    if (!/perm|temp/gi.test(args[1])) return message.channel.send(`You must specify the ban type \`perm, temp\`. \`/${this.usage}\``);
    if (!args[1]) return message.channel.send(`You must specify the ban type \`perm\` or \`temp\`. \`${this.usage}\``);
    if (args[1].toLowerCase() === 'temp' && !args[2]) return message.channel.send('You must provide a valid time. I.e: `24h, 12w, 13d`');
    const user = util.resolveUser(args[0], client.users.cache, false, false) || await client.users.fetch(args[0]).catch(() => null);
    if (!user) return message.channel.send('I couldn\'t find that user.');
    const member = await message.guild.members.fetch(user.id);
    let reason = args.slice(2).join(' ');
    if (!reason) reason = 'No reason given.';

    if (args[1].toLowerCase() === 'temp') {
      let time = ms(args[2]);
      if (!time) return message.channel.send('You must provide a valid time. I.e: `24h, 12w, 13d`');

      if (member && !member.bannable) return message.channel.send('I cannot ban that user.');

      try {
        await message.guild.members.ban(user.id);
      } catch (error) {
        console.error(error);
        return message.channel.send('Sorry, an error occured and I couldn\'t ban that user.');
      }
      const now = Date.now();
      time = time + now;

      const newInfraction = new Infractions({
        guildId: message.guild.id,
        userId: user.id,
        action: 'tempban',
        moderatorId: message.author.id,
        reason,
        Date: new Date()
      });

      const tempBan = new TempBans({
        guildId: message.guild.id,
        userId: user.id,
        reason,
        Date: new Date(),
        endTime: time,
        caseId: newInfraction.caseId
      });


      await tempBan.save();
      await newInfraction.save();

      message.channel.send(`Successfully banned ${user.tag} for ${ms(ms(args[2]), { long: true })}.`);
      const embedd = new MessageEmbed()
        .setTitle('Notice')
        .setColor(MODERATION_LOG_TYPE.TEMP_BAN.hex)
        .setDescription(`You have been temporarily banned from ${message.guild.name} for ${ms(ms(args[2]), { long: true })}.`)
        .addField('Reason', reason)
        .setFooter(user.username, user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      user.send(embedd).catch(() => null);

    } else if (args[1].toLowerCase() === 'perm') {
      if (member && !member.bannable) return message.channel.send('I cannot ban that user.');

      try {
        await message.guild.members.ban(user.id);
      } catch (error) {
        console.error(error);
        message.channel.send('Sorry, an error occured and I couldn\'t ban that user.');
      }

      const newInfraction = new Infractions({
        guildId: message.guild.id,
        userId: user.id,
        action: 'ban',
        moderatorId: message.author.id,
        reason,
        Date: new Date()
      });

      await newInfraction.save();

      message.channel.send(`Successfully banned ${user.tag}.`);
      const embedd = new MessageEmbed()
        .setTitle('Notice')
        .setColor(MODERATION_LOG_TYPE.BAN.hex)
        .setDescription(`You have been permanently banned from ${message.guild.name}.`)
        .addField('Reason', reason)
        .setFooter(user.username, user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      user.send(embedd).catch(() => null);
    }
  }
};
