const page = require('../page');

function Page(entity, query) {
	this.entity = entity;
	this.start = query.start;
	this.limit = query.limit;
	this.searchID = query.searchId;
	this.digicode = query.digicode;
}

Page.prototype.read = function (callback) {
	page.read(this, callback);
}

module.exports = Page;
