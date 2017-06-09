function Employee(body) {
	var data = body.response.employee;

	this.jobTitle = data.jobTitle;
	this.id = data.employeeId;
	this.firstName = data.firstName;
	this.lastName = data.lastName;
	this.address = data.address;
	this.city = data.city;
	this.state = data.state;
	this.county = data.county;
	this.candidate = data.candidate;
}

module.exports = Employee;
