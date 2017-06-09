const request = require('request');
const url = require('url');
const auth = require('./auth');
const diagnose = require('./diagnose');
const dispatcher = require('./dispatcher');

function object(entity, id, callback) {

	request.get({
		baseUrl: dispatcher.url,
		uri: dispatcher.path + `/object/${entity}/${id}`,
		headers: {
			'Cookie': 'authToken=' + auth.token
		},
		json: true
	}, (err, res, body) => {
		callback(diagnose(err, body), body);
	});
}

function search(entity, limit, callback) {
	request.get({
		baseUrl: dispatcher.url,
		uri: dispatcher.path + `/object/${entity}/search`,
		qs: {
			'limit': limit
		},
		headers: {
			'Cookie': 'authToken=' + auth.token
		},
		json: true
	}, (err, res, body) => {
		callback(diagnose(err, body), body);
	});
}

module.exports = {
	employee: {
		id: (id, callback) => object('employee', id, callback),
		count: (callback) => search('employee', 0, callback)
	},
	packet: {
		id: (id, callback) => object('packet', id, callback)
	}
}
