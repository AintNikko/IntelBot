const BaseCommand = require('../../utils/structures/BaseCommand');
const ms = require('ms');

module.exports = class SlowmodeCommand extends BaseCommand {
  constructor() {
    super({
      name: 'slowmode',
      description: 'Sets the slowmode for the channel.',
      category: 'Moderation',
      accessableby: 'Moderators',
      usage: 'slowmode [Duration | Remove]',
      aliases: ['ratelimit'],
      userPermissions: ['MANAGE_CHANNELS'],
      botPermissions: ['MANAGE_CHANNELS'],
      cooldown: 5
    });
  }

  async run(client, message, args) {

    if (!args[0]) return message.channel.send('You must provide a valid duration or `remove` to remove the slowmode.');

    if (args[0].toLowerCase() === 'remove') {
        await message.channel.setRateLimitPerUser(0, 'Slowmode command.');
        await message.channel.send('Successfully removed the slowmode.');
        return;
    }

    const duration = ms(args[0]);
    if (isNaN(duration) || duration > 21600000) return message.channel.send('Duration must be under or equal 6 hours.');

    await message.channel.setRateLimitPerUser(duration / 1000, 'Slowmode command.');

    message.channel.send(`Successfully set the slowmode to ${ms(duration, { long: true })}.`);

  }
};