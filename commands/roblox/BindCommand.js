const BaseCommand = require('../../utils/structures/BaseCommand');
const { MessageEmbed } = require('discord.js');
const nbx = require('noblox.js');

module.exports = class BindCommand extends BaseCommand {
    constructor() {
        super({
            name: 'bind',
            description: 'Binds a role to a roblox group rank or the whole group.',
            ownerOnly: false,
            category: 'roblox',
            accessableby: 'Administrators',
            usage: 'bind [Group | Role Id] ([Rank])',
            aliases: ['bindrank'],
            userPermissions: ['MANAGE_SERVER']
        });
    }

    async run(client, message, args, util) {

        const res = await client.getGuild(message.guild.id);

        if (!args[0]) return message.channel.send(`Invalid usage. \`${this.usage}\``);

        if (args[0].toLowerCase() === 'group') {

            if (!args[1]) return message.channel.send('Invalid usage, please specify the roblox group to bind.');

            const group = await nbx.getGroup(Number(args[1])).catch(() => null);
            if (!group) return message.channel.send('That group doesn\'t exist.');

            await client.updateGuild(message.guild, {
                robloxGroup: group.id
            });

            const doneEmbed = new MessageEmbed()
                .setTitle('Bound Roles')
                .setDescription(`Successfully bound ${group.name} group to the server.`)
                .setColor('GREEN')
                .setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

            message.channel.send(doneEmbed);

        } else {
            if (!res.robloxGroup) return message.channel.send('You have not set up a roblox group.');
            const group = await nbx.getGroup(res.robloxGroup).catch(() => null);
            if (!group) return message.channel.send('You have not set up a roblox group.');
            if (!args[1]) return message.channel.send(`Invalid usage. \`${this.usage}\``);
            const role = util.resolveRole(args[0], message.guild.roles.cache, true, true);
            if (!role) return message.channel.send('I couldn\'t find that role.');

            const match = args[1].match(/(\d+)-(\d+)/);
            if (match) {
                const start = parseInt(match[1]);
                const stop = parseInt(match[2]);

                if (start > stop) return message.channel.send('You cannot specify a range starting with a bigger number.');

                const bindings = [];
                const bound = [];

                for (let i = start; i <= stop; i++) {
                    const rank = await nbx.getRole(group.id, i).catch(() => null);
                    if (!rank) continue;

                    if (res.bindings.find(c => c.rank === rank.rank && c.roleId === role.id)) continue;

                    bindings.push({ roleId: role.id, rank: rank.rank });
                    bound.push({ role: role.id, rank: rank.rank });
                }

                res.bindings.push(...bindings);
                await res.save();

                const doneEmbed = new MessageEmbed()
                    .setTitle('Bound Roles')
                    .setDescription(`Successfully bound ${bound.length} bindings.\n\n${bound.map(c => `<@&${c.role}> => **${c.rank}**`).join('\n')}`)
                    .setColor('GREEN')
                    .setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                    .setTimestamp();

                message.channel.send(doneEmbed);
            } else {

                const groupRank = await nbx.getRole(group.id, Number(args[1]) || args[1]).catch(() => null);
                if (!groupRank) return message.channel.send('I couldn\'t find that roblox rank.');

                if (res.bindings.find(c => c.rank === groupRank.rank && c.roleId === role.id)) return message.channel.send('That role is already bound to that rank.');

                res.bindings.push({ roleId: role.id, rank: groupRank.rank });
                await res.save();

                const doneEmbed = new MessageEmbed()
                    .setTitle('Bound Role')
                    .setDescription(`Successfully bound ${role.name} to ${groupRank.rank}.`)
                    .setColor('GREEN')
                    .setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                    .setTimestamp();

                message.channel.send(doneEmbed);
            }
        }
    }
};