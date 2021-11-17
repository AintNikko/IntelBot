const Notes = require('../../utils/models/Notes');
const BaseCommand = require('../../utils/structures/BaseCommand');
const nbx = require('noblox.js');

module.exports = class NoteCommand extends BaseCommand {
    constructor() {
        super({
            name: 'note',
            category: 'owner',
            ownerOnly: true,
            aliases: ['nt'],
            description: 'Puts an important notice on a roblox profile.',
            usage: 'note [Roblox Username] [Note | remove]',
            examples: ['note moodyy_q scammer'],
            userPermissions: ['ADMINISTRATOR']
        });
    }

    async run(client, message, args) {

			if (!args[0] || !args[1]) return message.channel.send(`Invalid usage. ${this.usage}.`);

			const robloxId = await nbx.getIdFromUsername(args[0]).catch(() => null);
			if (!robloxId) return message.channel.send('That user does not exist.');

			if (args[1].toLowerCase() === 'remove') {
				const note = await Notes.findOne({ robloxId });
				if (!note) return message.channel.send('There isn\'t a note for the user.');

				await note.deleteOne();
				await message.channel.send('Successfully removed the note.');
			} else {
				const note = await Notes.findOne({ robloxId });

				if (note) {
					await note.updateOne({ note: args.slice(1).join(' ') });
				} else {
					await new Notes({
					robloxId,
					note: args.slice(1).join(' ')
				}).save();
				}

				await message.channel.send('Successfully added a note for the user.');
			}

		}
	}