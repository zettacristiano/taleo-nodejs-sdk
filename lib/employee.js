const async = require('async');
const url = require('url');
const object = require('./object');
const Employee = require('./object/employee');
const Packet = require('./object/packet');

function packets(emp, callback) {
	object.employee.packets(emp.id, (err, body) => {
		var list = body.response.activityPackets;
		var packets = [];

		async.eachSeries(list, (item, next) => {
			object.packet.id(item.packet.activityPacketId, (err, body) => {
				packets.push(body && new Packet(body));
				next(err);
			});
		}, (err) => {
			callback(err, packets);
		});
	});
}

function count(callback) {
	object.employee.search(0, (err, body) => {
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
	object.employee.search(0, (err, body) => {
		callback(err, body && createPages(limit, body));
	});
}

module.exports = {
	packets: packets,
	byID: byID,
	count: count,
	pages: pages
}
