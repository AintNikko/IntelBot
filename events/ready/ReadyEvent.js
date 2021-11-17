const BaseEvent = require('../../utils/structures/BaseEvent');
const nbx = require('noblox.js');
const Mutes = require('../../utils/models/Mutes');
const TempBans = require('../../utils/models/TempBans');
const ClientUtil = require('../../utils/structures/ClientUtil');

module.exports = class ReadyEvent extends BaseEvent {
  constructor() {
    super('ready');
  }

  async run(client) {
    console.log(`${client.user.username} [${client.user.id}] is ready to watch ${client.guilds.cache.reduce((prev, val) => val.memberCount + prev, 0)} users and ${client.guilds.cache.size} servers!`);
    await nbx.setCookie(process.env.COOKIE).then((user) => console.log(`${user.UserName} signed in.`));
    const statuses = [
      'commands',
      `${process.env.BOT_PREFIX}help`,
      `over ${client.guilds.cache.reduce((prev, val) => val.memberCount + prev, 0)} users!`];

    client.user.setActivity(statuses.random(), { type: 'WATCHING' });

    setInterval(() => {
      client.user.setActivity(statuses.random(), { type: 'WATCHING' });
    }, 60000);

    client.guilds.cache.keyArray().forEach(async guildId => {
      const res = await client.getGuild(guildId);

      if (!res) {
        return await client.makeGuild({ guildId });
      }
    });

    setInterval(async () => {

      client.guilds.cache.keyArray().forEach(async guildId => {
        const mutes = await Mutes.find({ guildId });
        const util = new ClientUtil(client);
        const guild = await client.guilds.cache.get(guildId);
        const temp = await TempBans.find({ guildId });

        if (temp.length >= 1) {
          for (let i = 0; i < temp.length; i++) {
            const ban = temp[i];
            if (ban.endTime - Date.now() <= 0) {
              try {
                await guild.members.unban(ban.userId);
                await TempBans.deleteOne({ guildId, userId: ban.userId });
              } catch (e) {
                console.error(e);
              }
            }
          }
        }

        if (mutes.length >= 1) {
          const role = util.resolveRole('Muted', guild.roles.cache);
          for (let i = 0; i < mutes.length; i++) {
            const mute = mutes[i];

            const member = util.resolveMember(mute.userId, guild.members.cache);

            if (mute.endTime - Date.now() <= 0) {
              try {
                await member.roles.remove(role, 'Mute expired.');
                await mute.delete();
              } catch (e) {
                await mute.delete();
                console.error(e);
              }
            }
          }
        }
      });
    }, 60000);
  }
};