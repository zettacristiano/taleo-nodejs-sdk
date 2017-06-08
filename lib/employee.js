const request = require('request');
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

module.exports = {
	count: count
}
