const BaseCommand = require('../../utils/structures/BaseCommand');

module.exports = class AccessCommand extends BaseCommand {
    constructor() {
        super({
            name: 'access',
            description: 'Adds or remove access to the info command.',
            category: 'admin',
            aliases: ['addaccess', 'removeaccess'],
            usage: 'access [add | remove] [User]',
            accessableby: 'Administrators',
            examples: ['access add ahmood', 'access remove 41321739812321389'],
            userPermissions: ['ADMINISTRATOR'],
            guildOnly: true
        });
    }

    async run(client, message, args, util) {

        if (!args[0] || !['add', 'remove'].includes(args[0].toLowerCase()) || !args[1]) return message.channel.send(`Invalid usage. Usage: ${this.usage}`);

        const res = await client.getGuild(message.guild.id);
        const user = util.resolveUser(args.slice(1).join(' '), client.users.cache, false, true);
        if (!user) return message.channel.send('I couldn\'t find that user.');

        switch (args[0].toLowerCase()) {
            case 'add': {
                if (res.infoAccess.includes(user.id)) return message.channel.send('That user already has access.');
                await client.updateGuild(message.guild.id, { $push: { infoAccess: user.id }});
                await message.channel.send(`Successfully gave access to ${user.username}.`);
                break;
            }
            case 'remove': {
                if (!res.infoAccess.includes(user.id)) return message.channel.send('That user does not have accesss.');
                await client.updateGuild(message.guild.id, { $pull: { infoAccess: user.id }});
                await message.channel.send(`Successfully removed access from ${user.username}.`);
                break;
            }
        }

    }
}