const path = require('path');
const { promises } = require('fs');

/**
 * Function to load commands
 * @param {DiscordClient} client Client representing a Discord.js client.
 * @param {string} dir Directory to load commands in
 */

async function registerCommands(client, dir = '') {
  const filePath = path.join(__dirname, dir);
  const files = await promises.readdir(filePath);
  for (const file of files) {
    const stat = await promises.lstat(path.join(filePath, file));
    if (stat.isDirectory()) registerCommands(client, path.join(dir, file));
    if (file.endsWith('.js') || file.endsWith('.ts')) {
      const Command = await require(path.join(dir, file));
      const command = new Command();
      client.commands.set(command.name, command);
      if (command.aliases.length > 0) command.aliases.forEach((alias) => {
        client.aliases.set(alias, command);
      });
    }
  }
}

/**
 * Function to load events
 * @param {DiscordClient} client Client representing a Discord.js client.
 * @param {string} dir Directory to load events in
 */

async function registerEvents(client, dir = '') {
  const filePath = path.join(__dirname, dir);
  const files = await promises.readdir(filePath);
  for (const file of files) {
    const stat = await promises.lstat(path.join(filePath, file));
    if (stat.isDirectory()) registerEvents(client, path.join(dir, file));
    if (file.endsWith('.js') || file.endsWith('.ts')) {
      const Event = await require(path.join(dir, file));
      const event = new Event();
      client.events.set(event.name, event);
      client.on(event.name, event.run.bind(event, client));
    }
  }
}

module.exports = {
    registerCommands,
    registerEvents
};