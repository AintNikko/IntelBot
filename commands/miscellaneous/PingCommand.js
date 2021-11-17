const BaseCommand = require('../../utils/structures/BaseCommand');
const { MessageEmbed } = require('discord.js');

module.exports = class PingCommand extends BaseCommand {
  constructor() {
    super({
      name: 'ping',
      category: 'miscellaneous',
      aliases: ['pong'],
      description: 'Latency and API response times.',
      examples: ['ping', 'pong']
    });
  }

  async run(client, message) {
    const pinging = new MessageEmbed()
    .setTitle('🏓 Ping!')
    .setColor(0x0051a2)
    .setDescription('Pinging...');

    const msg = await message.channel.send(pinging);

    const pong = new MessageEmbed()
    .setTitle('🏓 Pong!')
    .setColor(0x0df94f)
    .setDescription(`Roundtrip took ${msg.createdTimestamp - message.createdTimestamp}ms. 💙: ${client.ws.ping}ms.`);

    msg.edit(pong);
  }
};