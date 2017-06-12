function Activity(data) {
	this.id = data.id;
	this.title = data.title;
	this.desc = data.activityDesc;
	this.employeeID = data.activityEmployee;
	this.status = data.status;
}

module.exports = Activity;
