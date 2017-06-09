const request = require('request');
const url = require('url');
const auth = require('./auth');
const diagnose = require('./diagnose');
const dispatcher = require('./dispatcher');

function object(entity, id, rel, callback) {
	var path = `/object/${entity}/${id}`;

	if (rel)
		path += '/' + rel;

	request.get({
		baseUrl: dispatcher.url,
		uri: dispatcher.path + path,
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
		id: (id, callback) => object('employee', id, null, callback),
		search: (limit, callback) => search('employee', limit, callback)
	},
	packet: {
		id: (id, callback) => object('packet', id, null, callback)
	}
}
