const status = require('./status');

function Activity(data) {
	this.id = data.id;
	this.title = data.title;
	this.desc = data.activityDesc;
	this.employeeID = data.activityEmployee;
	this.status = data.status;
	this.href = {
		download: data.relationshipUrls.formDownloadUrl
	}
}

Activity.prototype.completed = function () {
	return this.status === status.COMPLETE;
}

module.exports = Activity;
