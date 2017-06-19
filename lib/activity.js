const fs = require('fs');
const object = require('./object');
const Activity = require('./object/activity');

function byID(id, callback) {
	object.activity.id(id, (err, body) => {
		callback(err, body && new Activity(body.response.activity));
	});
}

function count(callback) {
	object.activity.search(null, 0, null, null, (err, body) => {
		callback(err, body && body.response.pagination.total);
	});
}

function download(activity, path, callback) {
	object.activity.download(activity.id, fs.createWriteStream(path), (err) => {
		callback(err);
	});
}

module.exports = {
	byID: byID,
	count: count,
	download: download
}
