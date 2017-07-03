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

module.exports = Packet;
