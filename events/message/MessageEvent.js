const BaseEvent = require('../../utils/structures/BaseEvent');
const ClientUtil = require('../../utils/structures/ClientUtil');
const { Collection } = require('discord.js');
const cooldowns = new Collection();

module.exports = class MessageEvent extends BaseEvent {
    constructor() {
        super('message');
    }

    async run(client, message) {
        if (message.author.bot) return;

        const res = message.guild ? await client.getGuild(message.guild.id) : client.defaultSettings;
        const prefixMention = new RegExp(`^<@!?${client.user.id}> `);
        const prefix = message.content.match(prefixMention) ? message.content.match(prefixMention)[0] : res.prefix;

        if (message.content.startsWith(prefix)) {
            const util = new ClientUtil(client);
            const [cmdName, ...cmdArgs] = message.content
                .slice(prefix.length)
                .trim()
                .split(/\s+/);
            const command = client.commands.get(cmdName.toLowerCase()) || client.aliases.get(cmdName.toLowerCase());
            if (command) {

                if (command.ownerOnly && !command.checkOwner(message.author)) return message.channel.send(`The \`${command.name}\` command can only be used by the bot owner`);

                if (command.userPermissions.length >= 1 && !command.checkPermission(message.member, command.userPermissions)) return message.channel.send('You do not have permission to run this command.');

                if (command.botPermissions.length >= 1 && !message.guild.me.hasPermission(command.botPermissions[0])) return message.channel.send('I do not have permission to run this command.');

                if (command.userRoles.length >= 1 && !message.member.roles.cache.some(r => command.userRoles.includes(r.name))) return message.channel.send('You do not have permission to run this command.');

                if (!cooldowns.has(command.name)) cooldowns.set(command.name, new Collection());

                const now = Date.now();
                const timestamps = cooldowns.get(command.name);
                const cooldownAmount = (command.cooldown) * 1000;

                if (command.name === 'getinfo' && !timestamps.has(message.channel.id)) {
                    timestamps.set(message.channel.id, now);
                    setTimeout(() => timestamps.delete(message.channel.id), cooldownAmount);
                } else {
                    const expirationTime = timestamps.get(message.channel.id) + cooldownAmount;
                    if (now < expirationTime) {
                        const timeLeft = (expirationTime - now) / 1000;
                        return message.channel.send(`Please wait ${timeLeft.toFixed(1)} more second(s) before using the \`${command.name}\` command in this channel. ${message.author}`);
                    }
                }

                if (!timestamps.has(message.author.id)) {
                    timestamps.set(message.author.id, now);
                    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
                } else {
                    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
                    if (now < expirationTime) {
                        const timeLeft = (expirationTime - now) / 1000;
                        return message.channel.send(`Please wait ${timeLeft.toFixed(1)} more second(s) before using the \`${command.name}\` command. ${message.author}`);
                    }
                }
                
                try {
                    command.run(client, message, cmdArgs, util);
                } catch (error) {
                    console.error(error);
                    message.channel.send(`An error occured while executing this command! Report this to the bot owner: \`${error}\``);
                }
            }
        }
    }
};