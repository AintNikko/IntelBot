const BaseCommand = require('../../utils/structures/BaseCommand');
const { MessageEmbed } = require('discord.js');
const { COLOR_TYPES, urlRegex } = require('../../utils/structures/Constants');
const { stripIndent } = require('common-tags');
const nbx = require('noblox.js');
const Pending = require('../../utils/models/Pending');

module.exports = class ReportCommand extends BaseCommand {
    constructor() {
        super({
            name: 'report',
            category: 'miscellaneous',
            aliases: ['reportscammer', 'reportexploiter'],
            description: 'Report a scammer or exploiter to be reviewed by the staff team.'
        });
    }

    async run(client, message, args, util) {

        await message.channel.send('This prompt will resume in your DMs.');

        const dm = await message.author.createDM();
        const res = await client.getGuild(message.guild.id);

        const typeEmbed = new MessageEmbed()
            .setTitle('Prompt')
            .setColor(COLOR_TYPES.INFO)
            .setTimestamp()
            .setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
            .setDescription(stripIndent`
    Please specify the type of report you're making.
    
    > \`exploiter\`, \`scammer\`
    
    Respond with \`cancel\` to end this prompt.`);

        const type = await client.prompt.prompt(message, typeEmbed, { time: 120000, channel: dm, filter: ['exploiter', 'scammer'], correct: 'Please choose either `exploiter` or `scammer`.' }).then(coll => coll.first().content);

        const robloxIdEmbed = new MessageEmbed()
            .setTitle('Prompt')
            .setColor(0x5bc0de)
            .setTimestamp()
            .setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
            .setDescription(stripIndent`
    Please send the Roblox ID of the suspect.

    Respond with \`cancel\` to end this prompt.`);

        const robloxId = await client.prompt.prompt(message, robloxIdEmbed, {
            channel: dm, time: 120000, cancellable: true, messages: 1, filter: async (m, p) => (m.content.toLowerCase() === 'done' && p.values.size >= 1) || (m.content.length <= 1024 && !isNaN(m.content) && await nbx.getUsernameFromId(Number(m.content)).then(() => true).catch(() => false)), correct: async (m, p) => {

                if (m.content.length >= 1024) return 'Text must be under 1024 characters.';

                if (m.content.toLowerCase() === 'done' && p.values.size < 1) return 'You must provide at least 1 Roblox ID.';

                if (isNaN(m.content)) return 'You must provide a valid Roblox ID.';

                const robloxUser = await nbx.getUsernameFromId(Number(m.content)).catch(() => false);

                if (!robloxUser) return 'You must provide a valid Roblox ID.';

            }
        }).then((coll) => coll ? Number(coll.first().content) : []);

        const reasonEmbed = new MessageEmbed()
            .setTitle('Prompt')
            .setColor(COLOR_TYPES.INFO)
            .setTimestamp()
            .setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
            .setDescription(stripIndent`
    Please specify the reason of this report.
    
    Respond with \`cancel\` to end this prompt.`);

        const reason = await client.prompt.prompt(message, reasonEmbed, { time: 120000, channel: dm, filter: 1024, correct: 'Your text must be under 1024 characters.' }).then(coll => coll.first().content);

        const evidenceEmbed = new MessageEmbed()
            .setTitle('Prompt')
            .setColor(COLOR_TYPES.INFO)
            .setTimestamp()
            .setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
            .setDescription(stripIndent`
        Please specify any evidence/information you wish to include for this report.

        > Up to 5 HTTP(s) links /attachments are allowed and you may keep sending links/attachments until you reach that number, or reply with \`done\` once you have sent all your evidence/information.

        Respond with \`cancel\` to end this prompt.`);

        const evidence = await client.prompt.prompt(message, evidenceEmbed, {
            channel: dm, time: 120000, cancellable: true, messages: 5, filter: (m) => m.content.toLowerCase() === 'done' || (!m.attachments.size && urlRegex.test(m.content)), correct: (m) => {

                if (!urlRegex.test(m.content) && !m.attachments.size) return 'You must provide a valid URL or an attachment.';

                if (!m.content && !m.attachments.size) return 'You must provide a valid URL or an attachment';

            }, matchUntil: (m) => m.content.toLowerCase() === 'done'
        }).then(c => c.map(f => f.content ? f.content : f.attachments.first().url));

        const thumbnail = (await nbx.getPlayerThumbnail(robloxId, '720x720', 'png', false, 'body'))[0];
        const playerInfo = await nbx.getPlayerInfo(robloxId);

        const finalEmbed = new MessageEmbed()
            .setTitle(`${type.toProperCase()} Report`)
            .setColor(COLOR_TYPES.WARN)
            .setTimestamp()
            .setFooter(client.user.username, client.user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(thumbnail.imageUrl)
            .addFields([
                {
                    name: 'Reporter',
                    value: `${message.author.tag} [${message.author.id}]`
                },
                {
                    name: 'Suspect',
                    value: `${playerInfo.username} [${robloxId}]`
                },
                {
                    name: 'Reason',
                    value: reason
                },
                {
                    name: 'Evidence',
                    value: evidence.length > 0 ? evidence.map(c => `[Link](${c})`).join(', ') : 'None.'
                }
            ]);

        const channel = util.resolveChannel(res.channel, message.guild.channels.cache, false, true);
        if (!channel) return message.channel.send('The server owner has not set up the bot, please let your server administrators know.');

        const msg = await channel.send(finalEmbed);
        await msg.react('✅');
        await msg.react('❌');

        await new Pending({
            type,
            robloxId,
            evidence,
            reason,
            messageId: msg.id
        }).save();

        await dm.send('Successfully sent your report for review.', finalEmbed);
    }
};