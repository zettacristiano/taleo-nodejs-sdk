const request = require('request');
const auth = require('./auth');
const dispatcher = require('./dispatcher');
const diagnose = require('./diagnose');
const object = require('./object');

function Packet(body) {
	var packet = this;
	var data = body.response.packet;

	this.id = data.activityPacketId;
	this.ownerID = data.ownerId;
	this.creatorID = data.createdById;
	this.title = data.title;
	this.employeeID = data.employeeId;
}

function byID(id, callback) {
	object.packet.id(id, (err, body) => {
		callback(err, body && new Packet(body));
	});
}

module.exports = {
	byID: byID
}
