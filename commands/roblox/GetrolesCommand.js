const BaseCommand = require('../../utils/structures/BaseCommand');
const { MessageEmbed } = require('discord.js');
const robloxUsers = require('../../utils/models/RobloxUsers');
const nbx = require('noblox.js');

module.exports = class GetRolesCommand extends BaseCommand {
  constructor() {
    super({
      name: 'getroles',
      description: 'Get your corresponding roles.',
      ownerOnly: false,
      category: 'roblox',
      accessableby: 'Members',
      aliases: ['getrole'],
      botPermissions: ['MANAGE_NICKNAMES', 'MANAGE_ROLES'],
      cooldown: 10
    });
  }

  async run(client, message, args, util) {

    const res = await robloxUsers.findOne({ discordId: message.author.id });
    if (!res) return message.channel.send('You\'re not verified, please run the `verify` command to verify.');
    const guild = await client.getGuild(message.guild.id);
    // if (!guild.robloxGroup) return message.channel.send('The server owner has not setup the bot, please let one of the administrators know.');
    const user = await nbx.getUsernameFromId(res.robloxId);
    // const rankName = await nbx.getRankNameInGroup(guild.robloxGroup, res.get('robloxId'));
    // const rankNumber = (await nbx.getRole(guild.robloxGroup, rankName)).rank;
    // const ranks = await nbx.getRoles(guild.robloxGroup);
    // const guildRoles = message.guild.roles.cache.filter(c => ranks.some(f => f.name.includes(c.name))).sort((a, b) => a.rawPosition - b.rawPosition);
    // const rolesToRemove = [...message.member.roles.cache.array().filter(c => guildRoles.some(f => f.name.includes(c.name)) && c.name !== rankName)];
    const roles = [];
    let verifiedRole = util.resolveRole(guild.verifiedRole || '', message.guild.roles.cache, true, true) || util.resolveRole('Verified', message.guild.roles.cache, true, true);
    // let userRole = util.resolveRole(rankName, message.guild.roles.cache, true, true);

    if (!verifiedRole) {
      verifiedRole = await message.guild.roles.create({
        data: {
          name: 'Verified'
        }
      });
    }

    // if (!userRole) {
    //   userRole = await message.guild.roles.create({
    //     data: {
    //       name: rankName
    //     }
    //   });
    // }

    if (!message.member.roles.cache.has(verifiedRole.id)) roles.push(verifiedRole);

    // if (!message.member.roles.cache.has(userRole.id)) roles.push(userRole);

    // for (let i = 0; i < guild.bindings.length; i++) {
    //   const role = util.resolveRole(guild.bindings[i].roleId, message.guild.roles.cache, true, true);

    //   if (!role) continue;

    //   if (rankNumber === guild.bindings[i].rank && !message.member.roles.cache.has(role.id)) {
    //     roles.push(role);
    //   } else if (rankNumber !== guild.bindings[i].rank && message.member.roles.cache.has(role.id) && !rolesToRemove.find(c => c.id === role.id) && !guild.bindings.find(c => c.roleId === role.id && c.rank === rankNumber)) {
    //     rolesToRemove.push(role);
    //   }

    // }

    const givenRoles = [];
    // if (rolesToRemove.length >= 1) await message.member.roles.remove(rolesToRemove);
    await message.member.roles.add(roles);
    givenRoles.push(...roles);
    try {
      if (message.member.nickname !== user) await message.member.setNickname(user);
    } catch (error) {
      const embed = new MessageEmbed()
        .setTitle('Information')
        .addField('Nickname', user, true)
        .addField('Roles added', givenRoles.length >= 1 ? givenRoles.map(c => c.name).join(', ') : 'None', true)
        // .addField('Roles removed', rolesToRemove.length >= 1 ? rolesToRemove.map(c => c.name).join(', ') : 'None')
        .setColor('BLUE')
        .setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setDescription('I couldn\'t change your nickname due to my permissions.');

      return message.channel.send(embed);
    }

    const embed = new MessageEmbed()
      .setTitle('Information')
      .addField('Nickname', user, true)
      .addField('Roles added', givenRoles.length >= 1 ? givenRoles.map(c => c.name).join(', ') : 'None', true)
      // .addField('Roles removed', rolesToRemove.length >= 1 ? rolesToRemove.map(c => c.name).join(', ') : 'None')
      .setColor('BLUE')
      .setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    message.channel.send(embed);


  }
};