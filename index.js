const dotenv = require('dotenv');

dotenv.config();

module.exports = {
	activity: require('./lib/activity'),
	employee: require('./lib/employee'),
	dispatcher: require('./lib/dispatcher'),
	packet: require('./lib/packet'),
	location: require('./lib/location')
};
