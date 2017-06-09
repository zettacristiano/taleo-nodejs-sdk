function Packet(body) {
	var data = body.response.packet;

	this.id = data.activityPacketId;
	this.ownerID = data.ownerId;
	this.creatorID = data.createdById;
	this.title = data.title;
	this.employeeID = data.employeeId;
}

module.exports = Packet;
