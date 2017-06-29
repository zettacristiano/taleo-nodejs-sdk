function Location(data) {
	this.id = data.id;
	this.name = data.locationName;
	this.code = data.locationCode;
	this.address = data.address;
	this.zip = data.zipCode;
	this.country = data.countryCode;
	this.city = data.city;
	this.state = data.state;
	this.phone = data.phone;
}

module.exports = Location;
