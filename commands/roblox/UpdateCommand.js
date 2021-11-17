const BaseCommand = require('../../utils/structures/BaseCommand');
const { MessageEmbed } = require('discord.js');
const robloxUsers = require('../../utils/models/RobloxUsers');

module.exports = class UpdateCommand extends BaseCommand {
  constructor() {
    super({
      name: 'update',
      description: 'Updates a user\'s roles and nickname.',
      ownerOnly: false,
      category: 'roblox',
      accessableby: 'Administrators',
      usage: 'update [User]',
      botPermissions: ['MANAGE_NICKNAMES', 'MANAGE_ROLES'],
      userPermissions: ['MANAGE_NICKNAMES', 'MANAGE_ROLES'],
      cooldown: 10
    });
  }

  async run(client, message, args, util, nbx) {

    const member = util.resolveMember(args.join(' '), message.guild.members.cache) || member;

    const res = await robloxUsers.findOne({ discordId: member.user.id });

    if (!res) return message.channel.send('That user is not verified.');
    const guild = await client.getGuild(message.guild);
    if (!guild.robloxGroup) return message.channel.send('The server owner has not setup the bot, please let one of the administrators know.');
    const user = await nbx.getUsernameFromId(res.robloxId);
    const rankName = await nbx.getRankNameInGroup(guild.robloxGroup, res.get('robloxId'));
    const rankNumber = (await nbx.getRole(guild.robloxGroup, rankName)).rank;
    const rolesToRemove = [];
    const roles = [];
    let verifiedRole = util.resolveRole(guild.verifiedRole, message.guild.roles.cache, true, true) || util.resolveRole('Verified', message.guild.roles.cache, true, true);
    let userRole = util.resolveRole(rankName, message.guild.roles.cache, true, true);

    if (!verifiedRole) {
      verifiedRole = await message.guild.roles.create({
        data: {
          name: 'Verified'
        }
      });
    }

    if (!userRole) {
      userRole = await message.guild.roles.create({
        data: {
          name: rankName
        }
      });
    }

    if (!member.roles.cache.has(verifiedRole.id)) roles.push(verifiedRole);

    if (!member.roles.cache.has(userRole.id)) roles.push(userRole);

    for (let i = 0; i < guild.bindings.length; i++) {
      const role = util.resolveRole(guild.bindings[i].roleId, message.guild.roles.cache, true, true);

      if (!role) continue;

      console.log(guild.bindings[i].rank, role.name);

      if (rankNumber === guild.bindings[i].rank && !member.roles.cache.has(role.id)) {
        roles.push(role);
      } else if (rankNumber !== guild.bindings[i].rank && member.roles.cache.has(role.id) && !rolesToRemove.find(c => c.id === role.id) && !guild.bindings.find(c => c.roleId === role.id && c.rank === rankNumber)) {
        rolesToRemove.push(role);
      }

    }

    const givenRoles = [];

    try {
      if (member.nickname !== user) await member.setNickname(user);
      if (rolesToRemove && rolesToRemove.length >= 1) await member.roles.remove(rolesToRemove);
      await member.roles.add(roles);
      givenRoles.push(...roles);
    } catch (error) {
      console.log(error);
      const embed = new MessageEmbed()
        .setTitle('Information')
        .addField('Nickname', user, true)
        .addField('Roles added', givenRoles.length >= 1 ? givenRoles.map(c => c.name).join(', ') : 'None', true)
        .addField('Roles removed', rolesToRemove.length >= 1 ? rolesToRemove.map(c => c.name).join(', ') : 'None')
        .setColor('BLUE')
        .setFooter(member.displayName, member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setDescription('I couldn\'t change your nickname due to my permissions.');

      return message.channel.send(embed);
    }

    const embed = new MessageEmbed()
      .setTitle('Information')
      .addField('Nickname', user, true)
      .addField('Roles added', givenRoles.length >= 1 ? givenRoles.map(c => c.name).join(', ') : 'None', true)
      .addField('Roles removed', rolesToRemove.length >= 1 ? rolesToRemove.map(c => c.name).join(', ') : 'None')
      .setColor('BLUE')
      .setFooter(member.displayName, member.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    message.channel.send(embed);

  }
};