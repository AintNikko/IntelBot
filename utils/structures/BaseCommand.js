const { Message, PermissionString, User, GuildMember } = require('discord.js'); // eslint-disable-line
const DiscordClient = require('./Client'); // eslint-disable-line

/**
 * Class representing a Sugar Bowl command.
 * @param {CommandOptions} options Options representing the command information
 * @param options.name Name of the command.
 * @param options.category Category of the command.
 */
module.exports = class BaseCommand {
  constructor(options) {

    this.name = options.name;
    this.category = options.category;
    this.description = options.description;
		this.aliases = options.aliases || [];
    this.usage = options.usage || this.name;
    this.accessableby = options.accessableby || 'Members';
    this.cooldown = options.cooldown || 3;
    this.ownerOnly = options.ownerOnly || false;
    this.userPermissions = options.userPermissions || [];
    this.botPermissions = options.botPermissions || [];
    this.examples = options.examples || [this.name];
    this.userRoles = options.userRoles || [];

  }

  /**
   * Checks if the user is a bot owner
   * @param {User} user User to check if they're a bot owner
   */
  checkOwner(user) {
    return process.env.OWNERS.split(',').includes(user.id);
  }

  /**
   * Checks permission for the member in the guild.
   * @param {GuildMember} member Member of the guild
   * @param {Array<PermissionString>} perms Permissions to check for.
   */

  checkPermission(member, perms) {
    return member.permissions.has(perms);
  }

  /**
   * Run method for the command.
   * @param {DiscordClient} client Discord.js client.
   * @param {impoty('discord.js').Message} message Message sent by the user.
   * @param {Array<string>} args Array of the message's content.
   * @param {ClientUtil} util ClientUtil class.
   */

    run(client, message, args, util) { // eslint-disable-line no-unused-vars
      throw new Error(`${this.name} command doesn't have a run method.`);
     }
};