const object = require('./object');
const Packet = require('./object/packet');
const Activity = require('./object/activity');
const status = require('./object/status');

function byID(id, callback) {
	object.packet.id(id, (err, body) => {
		callback(err, body && new Packet(body.response.packet));
	});
}

function createActivities(body) {
	var activities = body.response.activities;
	var list = [];

	activities.forEach((item, idx) => {
		list.push(new Activity(item.activity));
	});

	return list;
}

function activities(packet, callback) {
	object.packet.activities(packet.id, (err, body) => {
		callback(err, body && createActivities(body));
	});
}

function complete(packet) {
	return packet.status === status.COMPLETE;
}

module.exports = {
	activities,
	complete: complete,
	byID: byID
}
