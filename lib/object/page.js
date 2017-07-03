function Page(entity, query) {
	this.entity = entity;
	this.start = query.start;
	this.limit = query.limit;
	this.searchID = query.searchId;
	this.digicode = query.digicode;
}

module.exports = Page;
