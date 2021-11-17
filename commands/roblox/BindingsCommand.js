const BaseCommand = require('../../utils/structures/BaseCommand');
const { MessageEmbed } = require('discord.js');
const nbx = require('noblox.js');

module.exports = class BindingsCommand extends BaseCommand {
    constructor() {
        super({
            name: 'bindings',
            description: 'Lists the bindings for the server.',
            ownerOnly: false,
            category: 'roblox',
            accessableby: 'Administrators',
            usage: 'bindings',
            aliases: ['listbindings', 'binds'],
            userPermissions: ['MANAGE_SERVER']
        });
    }

    async run(client, message) {

        const res = await client.getGuild(message.guild.id);
        if (!res.robloxGroup && res.bindings.length < 1) return message.channel.send('There are no bindings for the server.');
        const group = await nbx.getGroup(res.robloxGroup);

        const binds = res.bindings.sort((a, b) => a.rank - b.rank);

        let output = '';

        const skip = [];
        for (let i = 0; i < binds.length; i++) {
            if (skip.includes(binds[i].roleId)) continue;
            const dub = binds.filter(c => c.roleId === binds[i].roleId);

            if (dub.length > 1) {
                output += `**Rank Ranges:** ${dub[0].rank}-${dub[dub.length - 1].rank} => <@&${binds[i].roleId}>\n`;
                skip.push(binds[i].roleId);
                continue;
            }

            output += `**Rank:** ${binds[i].rank} => <@&${binds[i].roleId}>\n`;
        }

        const embed = new MessageEmbed()
            .setTitle('Bindings')
            .setColor('BLUE')
            .setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setDescription(`**Group:** ${group.name} [${group.id}]`);

        if (output.length > 1) embed.addField(`${group.name} [${group.id}]`, output);


        await message.channel.send(embed);
    }
};