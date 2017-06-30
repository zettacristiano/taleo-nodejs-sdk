function Employee(data) {
	this.jobTitle = data.jobTitle;
	this.id = data.employeeId;
	this.firstName = data.firstName;
	this.lastName = data.lastName;
	this.address = data.address;
	this.city = data.city;
	this.zip = data.zipCode;
	this.state = data.state;
	this.county = data.county;
	this.candidate = data.candidate;
	this.location = data.location;
}

module.exports = Employee;
