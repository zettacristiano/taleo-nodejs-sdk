const request = require('request');
const url = require('url');
const auth = require('./auth');
const diagnose = require('./diagnose');
const dispatcher = require('./dispatcher');

function count(callback) {
	request.get({
		baseUrl: dispatcher.url,
		uri: dispatcher.path + '/object/employee/search',
		qs: {
			'limit': 0
		},
		headers: {
			'Cookie': 'authToken=' + auth.token
		},
		json: true
	}, (err, res, body) => {
		callback(diagnose(err, body), body && body.response.pagination.total);
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
	request.get({
		baseUrl: dispatcher.url,
		uri: dispatcher.path + '/object/employee/search',
		qs: {
			'limit': limit
		},
		headers: {
			'Cookie': 'authToken=' + auth.token
		},
		json: true
	}, (err, res, body) => {
		callback(diagnose(err, body), body && createPages(limit, body));
	});
}

module.exports = {
	count: count,
	pages: pages
}
