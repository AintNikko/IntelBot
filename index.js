require('dotenv').config();

String.prototype.toProperCase = function() {
	return this.toLowerCase().replace(/(^|[\s.])[^\s.]/gm, (s) => s.toUpperCase());
};

Array.prototype.random = function() {
    return this[Math.floor(Math.random() * this.length)];
};

String.prototype.isEmpty = function() {
    return (this.length === 0 || !this.trim());
};

const Client = require('./utils/structures/Client');
const { registerCommands, registerEvents } = require('./utils/registery');
const mongoose = require('./utils/structures/Database');
const client = new Client({ partials: ['REACTION', 'MESSAGE'] });
const app = require('express')();

app.get('/', (req, res) => {
	res.status(200).send('Bap');
});

(async () => {
    await registerCommands(client, '../commands');
    await registerEvents(client, '../events');
    await client.login(process.env.TOKEN);
    mongoose.init();
		await app.listen(8080);
})();