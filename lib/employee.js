const async = require('async');
const url = require('url');
const object = require('./object');
const Employee = require('./object/employee');
const Packet = require('./object/packet');
const Page = require('./object/page');
const Location = require('./object/location');

function packets(emp, callback) {
	object.employee.packets(emp.id, (err, body) => {
		if (err) {
			return callback(err);
		}

		var list = body.response.activityPackets;
		var packets = [];

		async.eachSeries(list, (item, next) => {
			object.packet.id(item.packet.activityPacketId, (err, body) => {
				packets.push(body && new Packet(body.response.packet));
				next(err);
			});
		}, (err) => {
			if (err) {
				return callback(err);
			} else {
				return callback(null, packets);
			}
		});
	});
}

function location(emp, callback) {
	if (!emp.location) {
		return callback(new Error('Employee does not have a listed location'));
	}

	object.employee.location(emp.id, (err, body) => {
		if (err) {
			return callback(err);
		} else {
			return callback(null, body && new Location(body.response.location));
		}
	});
}

function count(callback) {
	object.employee.search(null, 0, null, null, (err, body) => {
		if (err) {
			return callback(err);
		} else {
			return callback(null, body && body.response.pagination.total);
		}
	});
}

function byID(id, callback) {
	object.employee.id(id, (err, body) => {
		if (err) {
			return callback(err);
		} else {
			return callback(err, body && new Employee(body.response.employee));
		}
	});
}

/* Helper function for pages(). Creates page objects from the HTTP response
 * body.
 */
function createPages(limit, body) {
	var total = body.response.pagination.total;
	var query = url.parse(body.response.pagination.self, true).query;
	var res = [];

	for (var i = 1; i < total; i += limit) {
		query.start = i;
		// If start + limit > total, adjust limit
		query.limit = Math.min(total - i + 1, limit);

		res.push(new Page('employee', query));
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
	object.employee.search(null, 0, null, null, (err, body) => {
		callback(err, body && createPages(limit, body));
	});
}

module.exports = {
	packets: packets,
	location: location,
	byID: byID,
	count: count,
	pages: pages
}
