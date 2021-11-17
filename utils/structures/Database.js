const mongoose = require('mongoose');

module.exports = {
	init: () => {
		const dbOptions = {
			useNewUrlParser: true,
			useFindAndModify: false,
			useUnifiedTopology: true,
			autoIndex: false
		};

		mongoose.connect(process.env.MONGO_URL, dbOptions);
		mongoose.set('useFindAndModify', false);
		mongoose.Promise = global.Promise;

		mongoose.connection.on('connected', () => {
			console.log('Mongoose connection successfully opened!');
		});

		mongoose.connection.on('err', (err) => {
			console.log(`Mongoose connection error: \n ${err.stack}`);
		});

		mongoose.connection.on('disconnected', () => {
			console.log('Mongoose connection disconnected');
		});
	}
};