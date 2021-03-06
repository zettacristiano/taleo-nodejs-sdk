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

module.exports = Activity;
