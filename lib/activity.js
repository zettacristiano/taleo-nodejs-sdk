const object = require('./object');
const Activity = require('./object/activity');

function byID(id, callback) {
	object.activity.id(id, (err, body) => {
		callback(err, body && new Activity(body));
	});
}

function count(callback) {
	object.activity.search(0, (err, body) => {
		callback(err, body && body.response.pagination.total);
	});
}

module.exports = {
	byID: byID,
	count: count
}
