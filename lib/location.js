const Location = require('./object/location');
const object = require('./object');

function byID(id, callback) {
	object.location.id(id, (err, body) => {
		callback(err, body && new Location(body.response.location));
	});
}

function all(callback) {
	object.location.all((err, body) => {
		if (err) {
			return callback(err);
		}

		var list = [];

		body.response.locations.forEach((item) => {
			list.append(new Location(item.location));
		});

		callback(null, list);
	});
}

module.exports = {
	byID: byID,
	all: all
}
