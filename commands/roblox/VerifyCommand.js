const BaseCommand = require('../../utils/structures/BaseCommand');
const { MessageEmbed } = require('discord.js');
const RobloxUsers = require('../../utils/models/RobloxUsers');
const nbx = require('noblox.js');
const { stripIndent } = require('common-tags');

module.exports = class VerifyCommand extends BaseCommand {
  constructor() {
    super({
      name: 'verify',
      description: 'Link your ROBLOX account to your Discord account.',
      ownerOnly: false,
      category: 'roblox',
      accessableby: 'Members',
      aliases: ['ver'],
      botPermissions: ['MANAGE_NICKNAMES', 'MANAGE_ROLES'],
      cooldown: 30
    });
  }

  async run(client, message, args, util) {

    const robloxUser = await RobloxUsers.findOne({ discordId: message.author.id });

    const code = client.generateKey(8);

    const robloxUsernameEmbed = new MessageEmbed()
      .setTitle('Verification')
      .setDescription(stripIndent`
    What is your ROBLOX Username?
    
    Type \`cancel\` to cancel`)
      .setColor('BLUE')
      .setFooter('This prompt will cancel in 5 minutes');

    const codeEmbed = new MessageEmbed()
      .setTitle('Verification')
      .setDescription(stripIndent`
    Put this code in your ROBLOX bio: 
    \`\`\`${code}\`\`\`
    
    Send \`done\` when you're ready, and \`cancel\` to cancel`)
      .setColor('BLUE')
      .setImage('https://moody.has-no-bra.in/T0uAe2.png')
      .setFooter('This prompt will cancel in 5 minutes');

    const dm = await message.author.createDM();

    if (!robloxUser) {

      await message.channel.send('This prompt will resume in your DMs.');

      const userData = await client.prompt.prompt(message, robloxUsernameEmbed, {
        channel: dm, time: 300000, cancellable: true, filter: async (m) => await nbx.getIdFromUsername(m.content).then(() => true).catch(() => false), correct: async (m) => {
          if (!(await nbx.getIdFromUsername(m.content).catch(() => null))) return 'You must provide a valid Roblox username.';
        }
      }).then(async coll => {
        const id = await nbx.getIdFromUsername(coll.first().content);
        const username = await nbx.getUsernameFromId(id);

        return {
          id,
          username
        };
      });

      const done = await client.prompt.prompt(message, codeEmbed, {
        channel: dm, time: 300000, cancellable: true, filter: async m => m.content.toLowerCase().includes('done') && (await nbx.getPlayerInfo(userData.id)).blurb.includes(code), correct: async m => {
          if (!m.content.toLowerCase().includes('done')) return 'Please reply with `done` once finished.';

          if (!(await nbx.getPlayerInfo(userData.id)).blurb.includes(code)) return 'I did not find the code in your Roblox bio. Please make sure you put it in your Roblox bio and type `done` once done.';
        }
      }).then(() => true);

      if (done) {

        await new RobloxUsers({
          discordId: message.author.id,
          robloxId: userData.id
        }).save();

        const verifyEmbed = new MessageEmbed()
          .setTitle('Verification')
          .setColor('GREEN')
          .setDescription(`Successfully linked ${userData.username} to your Discord account.`)
          .setTimestamp()
          .setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }));

        await dm.send(verifyEmbed);
      }
    } else {
      const userName = await nbx.getUsernameFromId(robloxUser.robloxId);
      const verifyEmbed = new MessageEmbed()
        .setTitle('Verification')
        .setColor('GREEN')
        .setDescription(`Successfully linked ${userName} to your Discord account.`)
        .setTimestamp()
        .setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }));
      await dm.send(verifyEmbed);
      await client.commands.get('getroles').run(client, message, args, util);
    }
  }
};