const BaseCommand = require('../../utils/structures/BaseCommand');

module.exports = class TestCommand extends BaseCommand {
  constructor() {
    super({
      name: 'test',
      description: 'This is a test command',
      ownerOnly: true,
      category: 'owner',
      accessableby: 'Bot owner',
      aliases: ['t']
    });
  }

  async run(client, message) {

   message.channel.send('This is a test command.');

  }
};