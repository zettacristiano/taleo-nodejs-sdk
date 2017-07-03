const fs = require('fs');
const object = require('./object');
const Activity = require('./object/activity');
const status = require('./object/status');

function completed(activity) {
	return activity.status === status.COMPLETE;
}

function signed(activity) {
	// Currently not a clear way to determine if an activity is signed,
	// but it appears that if the activity is awaiting e-signature,
	// it has two assignees (one for the employee, one for the TBE user
	// signer). Apparently both signatures are required for downloads
	// to work.
	return (activity.assignees && activity.assignees.length === 1) && completed(activity);
}

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
	if (!signed(activity)) {
		return callback('Activity is not available for download');
	}

	object.activity.download(activity.id, fs.createWriteStream(path), (err) => {
		callback(err);
	});
}

module.exports = {
	byID: byID,
	count: count,
	download: download,
	completed: completed,
	signed: signed
}
