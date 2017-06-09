const request = require('request');
const url = require('url');
const auth = require('./auth');
const diagnose = require('./diagnose');
const dispatcher = require('./dispatcher');
const object = require('./object');

function Employee(body) {
	var emp = this;
	var data = body.response.employee;

	this.jobTitle = emp.jobTitle;
	this.id = emp.employeeId;
	this.firstName = emp.firstName;
	this.lastName = emp.lastName;
	this.address = emp.address;
	this.city = emp.city;
	this.state = emp.state;
	this.county = emp.county;
	this.candidate = emp.candidate;
}

function count(callback) {
	object.employee.count((err, body) => {
		callback(err, body && body.response.pagination.total);
	});
}

function byID(id, callback) {
	object.employee.id(id, (err, body) => {
		callback(err, body && new Employee(body));
	});
}

/* Helper function for pages(). Creates page objects from the HTTP response
 * body.
 */
function createPages(limit, body) {
	var total = body.response.pagination.total;
	var query = url.parse(body.response.pagination.next, true).query;
	var res = [];

	for (var i = 1; i < total; i += limit) {
		var page = {};

		query.start = i;
		// If start + limit > total, adjust limit
		query.limit = Math.min(total - i + 1, limit);

		page.query = JSON.parse(JSON.stringify(query));
		// build page functions, e.g. each()

		res.push(page);
	}

	return res;
}

/* Get pages of employees that can be queried individually. `limit' is the
 * number of employees to include in one page. Callback is expected to be
 * an error-first function with an additional argument: an array of page
 * objects.
 *
 * Each page object has a query which can be passed to other employee search
 * requests.
 */
function pages(limit, callback) {
	object.employee.count((err, body) => {
		callback(err, body && createPages(limit, body));
	});
}

module.exports = {
	byID: byID,
	count: count,
	pages: pages
}
