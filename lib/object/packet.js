const status = require('./status');

function Packet(data) {
	this.id = data.activityPacketId;
	this.ownerID = data.ownerId;
	this.creatorID = data.createdById;
	this.title = data.title;
	this.employeeID = data.employeeId;
	this.status = data.status;
	this.activities = data.activitiesCount;
	this.activitiesCompleted = data.activitiesCompleted;
}

Packet.prototype.isComplete = function () {
	return this.status === status.COMPLETE;
}

module.exports = Packet;
