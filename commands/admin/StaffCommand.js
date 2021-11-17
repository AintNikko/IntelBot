const BaseCommand = require('../../utils/structures/BaseCommand');

module.exports = class StaffCommand extends BaseCommand {
    constructor() {
        super({
            name: 'staff',
            description: 'Adds or removes staff for the bot.',
            category: 'admin',
            aliases: ['addstaff', 'removestaff'],
            usage: 'staff [add | remove] [User]',
            accessableby: 'Administrators',
            examples: ['staff add ahmood', 'staff remove 41321739812321389'],
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
                if (res.staff.includes(user.id)) return message.channel.send('That user is already a staff member.');
                await client.updateGuild(message.guild.id, { $push: { staff: user.id }});
                await message.channel.send(`Successfully added ${user.username} as a staff member.`);
                break;
            }
            case 'remove': {
                if (!res.staff.includes(user.id)) return message.channel.send('That user is not a staff member.');
                await client.updateGuild(message.guild.id, { $pull: { staff: user.id }});
                await message.channel.send(`Successfully removed ${user.username} from the staff team.`);
                break;
            }
        }

    }
}