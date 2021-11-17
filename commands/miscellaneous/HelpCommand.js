const { MessageEmbed } = require('discord.js');
const BaseCommand = require('../../utils/structures/BaseCommand');
const { COLOR_TYPES } = require('../../utils/structures/Constants');

module.exports = class HelpCommand extends BaseCommand {
  constructor() {
    super({
      name: 'help',
      category: 'miscellaneous',
      aliases: ['h', 'cmds', 'commands'],
      description: 'Displays a list of all current commands, sorted by category.',
      usage: 'help (Command)',
      examples: ['help', 'help ping', 'h avatar']
    });
  }

  async run(client, message, args) {
    const res = message.guild ? await client.getGuild(message.guild.id) : client.defaultSettings;
    const embed = new MessageEmbed()
    .setColor(COLOR_TYPES.INFO)
    .setAuthor(`${client.user.username} Help`, message.guild.iconURL({ dynamic: true }))
    .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
    .setDescription(`These are the avaliable commands for ${client.user.username}\nThe bot prefix is: \`${res.prefix}\` or \`${client.user.tag}\``)
    .setFooter(`${message.author.username} | Total Commands: ${client.commands.size}`, message.author.displayAvatarURL({ dynamic: true }));

    if (!args[0]) {
      const commands = client.commands;
      let currentCategory = '';
      const sorted = commands.array().sort((p, c) => p.category > c.category ? 1 : p.name > c.name && p.category === c.category ? 1 : -1);
      sorted.forEach(c => {
        const cat = c.category.toProperCase();
        if (currentCategory !== cat) {
          currentCategory = cat;
          if (process.env.OWNERS.split(',').includes(message.author.id)) embed.addField(`${currentCategory}`, commands.filter(a => a.category.toProperCase() === currentCategory).map(b => `\`${b.name}\``).join(', '));
          else if (currentCategory !== 'Owner') embed.addField(`${currentCategory}`, commands.filter(a => a.category.toProperCase() === currentCategory).map(b => `\`${b.name}\``).join(', '));
        }
      });

      message.channel.send(embed);
    } else {
      const command = client.commands.get(args[0]) || client.aliases.get(args[0]);
      if (command) {
        const commandEmbed = new MessageEmbed()
          .setTitle(`Command: \`${command.name}\``)
          .setThumbnail(client.user.avatarURL({ dynamic: true }))
          .setDescription(command.description)
          .addField('Usage', `\`${res.prefix}${command.usage}\``, true)
          .addField('Category', `\`${command.category.toProperCase()}\``, true)
          .setFooter(message.member.displayName, message.author.avatarURL({ dynamic: true }))
          .setTimestamp()
          .setColor(COLOR_TYPES.INFO);
        if (command.aliases.length >= 1) commandEmbed.addField('Aliases', command.aliases.map(c => `\`${c}\``).join(', '));
        if (command.examples.length >= 1) commandEmbed.addField('Examples', command.examples.map(c => `\`${res.prefix}${c}\``).join('\n'));
        if (command.cooldown) commandEmbed.addField('Cooldown', `\`${command.cooldown}\``);
        if (command.accessableby) commandEmbed.addField('Accessableby', `\`${command.accessableby}\``);

        message.channel.send(commandEmbed);
      }
    }
  }
};