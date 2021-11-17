const BaseCommand = require('../../utils/structures/BaseCommand');
const { MessageEmbed } = require('discord.js');
const RobloxUsers = require('../../utils/models/RobloxUsers');
const nbx = require('noblox.js');
const { COLOR_TYPES, DevforumRanks, PresenceTypes } = require('../../utils/structures/Constants');
const axios = require('axios');
const moment = require('moment');
const numeral = require('numeral');
const _ = require('lodash');
const Blacklists = require('../../utils/models/Blacklists');
const Notes = require('../../utils/models/Notes');

module.exports = class GetinfoCommand extends BaseCommand {
    constructor() {
        super({
            name: 'getinfo',
            description: 'Get information about a Roblox account.',
            ownerOnly: false,
            category: 'roblox',
            accessableby: 'Members',
            aliases: ['getinf', 'info'],
            cooldown: 30,
            guildOnly: true,
            usage: 'getinfo [Roblox Username]',
            examples: ['getinfo moodyy_q']
        });
    }

    async run(client, message, args) {

        const res = await client.getGuild(message.guild.id);
        if (!res.infoAccess.includes(message.author.id)) return message.channel.send('You do not have access to use this command.');

        const robloxId = await nbx.getIdFromUsername(args.join(' ')).catch(() => null);
        if (!robloxId) return message.channel.send('I couldn\'t find that user.');
        const playerInfo = await nbx.getPlayerInfo(robloxId);

        await message.channel.send(`Getting information on ${playerInfo.username} [${robloxId}]. This may take a few seconds...`);

        const embeds = [];
        const robloxUser = await RobloxUsers.findOne({ robloxId });
        const isExploiter = await client.managers.exploiters.get(robloxId);
        const isScammer = await client.managers.scammers.get(robloxId);
        const thumbnail = await nbx.getPlayerThumbnail(robloxId, '720x720', 'png', false, 'body');
				console.log('here');
        const devforum = await axios.get(`https://devforum.roblox.com/u/${playerInfo.username}.json`).catch(() => null);
        const friends = await nbx.getFriends(robloxId);
        const presence = (await nbx.getPresences([robloxId])).userPresences[0];
        const groups = await nbx.getGroups(robloxId);
        const blacklist = await Blacklists.findOne({ robloxId });
				const note = await Notes.findOne({ robloxId });
        let rap = await axios.get(`https://inventory.roblox.com/v1/users/${robloxId}/assets/collectibles?sortOrder=Asc&limit=100`).catch(() => null);
        if (!rap) rap = 'Inventory hidden';
        else rap = rap.data.data.reduce((prev, val) => val.recentAveragePrice + prev, 0);

        if (devforum && devforum.data.user.trust_level > 0) {
            const devforumEmbed = new MessageEmbed()
                .setTitle('Devforum Status')
                .setColor(COLOR_TYPES.INFO)
                .setTimestamp()
                .setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                .setDescription(`${playerInfo.username} is a devforum member. Rank: ${DevforumRanks[devforum.data.user.trust_level]}`);

            embeds.push(devforumEmbed);
        }

				if (note) {
					const noteEmbed = new MessageEmbed()
                .setTitle('Important Notice')
                .setColor(COLOR_TYPES.WARN)
                .setTimestamp()
                .setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                .setDescription(`There is a note for ${playerInfo.username}. \`${note.note}\``);

            embeds.push(noteEmbed);
				}

        if (blacklist) {
            const blacklistEmbed = new MessageEmbed()
                .setTitle('Blacklist Status')
                .setColor(COLOR_TYPES.DANGER)
                .setTimestamp()
                .setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                .setDescription(`${playerInfo.username} is blacklisted. Reason: ${blacklist.reason}`);

            embeds.push(blacklistEmbed);
        }

        const general = new MessageEmbed()
            .setTitle('General Information')
            .setColor(COLOR_TYPES.INFO)
            .setTimestamp()
            .setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
            .setThumbnail(thumbnail.imageUrl)
            .addFields([
                {
                    name: 'Account age',
                    value: numeral(playerInfo.age).format('0,0'),
                    inline: true
                },
                {
                    name: 'Creation Date',
                    value: moment.utc(playerInfo.joinDate).format('L'),
                    inline: true
                },
                {
                    name: 'Verified',
                    value: robloxUser ? 'Yes' : 'No',
                    inline: true
                },
                {
                    name: 'Roblox Ban Status',
                    value: playerInfo.isBanned ? 'Yes' : 'No',
                    inline: true
                },
                {
                    name: 'Devforum Status',
                    value: devforum ? DevforumRanks[devforum.data.user.trust_level] : 'Unknown',
                    inline: true
                },
                {
                    name: 'Exploiter Status',
                    value: isExploiter ? 'Yes' : 'No',
                    inline: true
                },
                {
                    name: 'Scammer Status',
                    value: isScammer ? 'Yes' : 'No'
                },
                {
                    name: 'Rap',
                    value: numeral(rap).format('0,0'),
                    inline: true
                },
                {
                    name: 'Past Usernames Count',
                    value: playerInfo.oldNames ? playerInfo.oldNames.length : 0,
                    inline: true
                },
                {
                    name: 'Friend Count',
                    value: numeral(playerInfo.friendCount).format('0,0'),
                    inline: true
                },
                {
                    name: 'Followers Count',
                    value: numeral(playerInfo.followerCount).format('0,0'),
                    inline: true
                },
                {
                    name: 'Following Count',
                    value: numeral(playerInfo.followingCount).format('0,0'),
                    inline: true
                },
                {
                    name: 'Banned Friends Count',
                    value: numeral(friends.data.filter(c => c.isDeleted).length).format('0,0'),
                    inline: true
                },
                {
                    name: 'Groups Count',
                    value: numeral(groups.length).format('0,0'),
                    inline: true
                },
                {
                    name: 'Profile',
                    value: `[Link](https://www.roblox.com/users/${robloxId}/profile)`,
                    inline: true
                }
            ]);

        embeds.push(general);

        const blurbEmbed = new MessageEmbed()
            .setTitle(`${playerInfo.username}'s Blurb`)
            .setColor(COLOR_TYPES.INFO)
            .setTimestamp()
            .setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
            .setDescription(playerInfo.blurb);

        embeds.push(blurbEmbed);

        const presenceEmbed = new MessageEmbed()
            .setTitle(`${playerInfo.username}'s Presence Status`)
            .setColor(COLOR_TYPES.INFO)
            .setTimestamp()
            .setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
            .addFields([
                {
                    name: 'Online Status',
                    value: presence.userPresenceType > 0 ? 'Online' : 'Offline',
                    inline: true
                },
                {
                    name: 'Location Type',
                    value: PresenceTypes[presence.userPresenceType],
                    inline: true
                },
                {
                    name: 'Last Online',
                    value: moment.utc(presence.lastOnline).format('L[,] hh:mm [UTC]'),
                    inline: true
                }
            ]);

        embeds.push(presenceEmbed);

        const pastUsersEmbed = new MessageEmbed()
            .setTitle(`${playerInfo.username}'s Past Usernames`)
            .setColor(COLOR_TYPES.INFO)
            .setTimestamp()
            .setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
            .setDescription(playerInfo.oldNames.join('\n'));

        embeds.push(pastUsersEmbed);

        const chunks = _.chunk(friends.data, 20);

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const friendsEmbed = new MessageEmbed()
                .setTitle(`${playerInfo.username}'s Friends`)
                .setColor(COLOR_TYPES.INFO)
                .setTimestamp()
                .setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }));

            for (let j = 0; j < chunk.length; j++) {
                const friend = chunk[j];
                friendsEmbed.addField(friend.name, `[Link](https://www.roblox.com/users/${friend.id}/profile)`, true);
            }

            embeds.push(friendsEmbed);
        }

        const groupChunks = _.chunk(groups, 20);

        for (let i = 0; i < groupChunks.length; i++) {
            const chunk = groupChunks[i];
            const groupEmbed = new MessageEmbed()
                .setTitle(`${playerInfo.username}'s Group Information`)
                .setTimestamp()
                .setColor(COLOR_TYPES.INFO)
                .setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }));

            for (let j = 0; j < chunk.length; j++) {
                const group = chunk[j];
                groupEmbed.addField(`${group.Name} [${group.Id}]`, `**Members:** ${numeral(group.MemberCount).format('0,0')}\n**Rank:** ${group.Role} [${group.Rank}]`, true);
            }

            embeds.push(groupEmbed);
        }

        for (const embed of embeds) {
            await message.channel.send(embed);
            await client.wait(1000);
        }

        await message.channel.send(`Successfully sent all information on ${playerInfo.username}.`);

    }
};