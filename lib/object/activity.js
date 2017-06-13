const status = require('./status');

function Activity(data) {
	this.id = data.id;
	this.title = data.title;
	this.desc = data.activityDesc;
	this.employeeID = data.activityEmployee;
	this.status = data.status;
	this.href = {
		download: data.relationshipUrls.formDownloadUrl
	};
	this.assignees = data.assignee && data.assignee.slice();
}

Activity.prototype.completed = function () {
	return this.status === status.COMPLETE;
}

Activity.prototype.signed = function () {
	// Currently not a clear way to determine if an activity is signed,
	// but it appears that if the activity is awaiting e-signature,
	// it has two assignees (one for the employee, one for the TBE user
	// signer). Apparently both signatures are required for downloads
	// to work.
	return (this.assignees && this.assignees.length === 1) && this.completed();
}

module.exports = Activity;
