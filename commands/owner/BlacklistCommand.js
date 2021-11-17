const Blacklists = require('../../utils/models/Blacklists');
const BaseCommand = require('../../utils/structures/BaseCommand');
const nbx = require('noblox.js');

module.exports = class BlacklistCommand extends BaseCommand {
    constructor() {
        super({
            name: 'blacklist',
            category: 'owner',
            ownerOnly: true,
            aliases: ['bl'],
            description: 'Blacklists a Roblox user.',
            usage: 'blacklist [add | remove] [Roblox Username] [Reason]',
            examples: ['blacklist add moodyy_q noob'],
            userPermissions: ['ADMINISTRATOR']
        });
    }

    async run(client, message, args) {

        if (!args[0] || !['add', 'remove'].includes(args[0].toLowerCase())) return message.channel.send('Invalid usage. You must choose either `add` or `remove`.');

        switch (args[0].toLowerCase()) {
            case 'add': {
                if (!args[1]) return message.channel.send('You must provide a Roblox Username.');
                const robloxId = await nbx.getIdFromUsername(args[1]).catch(() => null);
                if (!robloxId) return message.channel.send('I couldn\'t find that user.');
                if (await Blacklists.exists({ robloxId })) return message.channel.send('That user is already blacklisted.');
                let reason = args.slice(2).join(' ');
                if (!reason) reason = 'No reason given.';
                await new Blacklists({
                    robloxId,
                    reason
                }).save();

                const username = await nbx.getUsernameFromId(robloxId);

                message.channel.send(`Successfully blacklisted \`${username}\`.`);
                break;
            }
            case 'remove': {
                if (!args[1]) return message.channel.send('You must provide a Roblox Username.');
                const robloxId = await nbx.getIdFromUsername(args[1]).catch(() => null);
                if (!robloxId) return message.channel.send('I couldn\'t find that user.');
                const blacklist = await Blacklists.findOne({ robloxId });
                if (!blacklist) return message.channel.send('That user is not blacklisted.');
                await blacklist.delete();

                const username = await nbx.getUsernameFromId(robloxId);

                message.channel.send(`Successfully unblacklisted \`${username}\`.`);
                break;
            }
        }
    }
};