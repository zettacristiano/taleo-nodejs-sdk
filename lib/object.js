const request = require('request');
const async = require('async');
const url = require('url');
const auth = require('./auth');
const diagnose = require('./diagnose');
const dispatcher = require('./dispatcher');

function object(entity, id, rel, callback) {
	var path = `/object/${entity}/${id}`;

	if (rel)
		path += '/' + rel;

	async.waterfall([
		(callback) => {
			auth.login((err, token) => {
				callback(null, token);
			});
		},
		(token, callback) => {
			request.get({
				baseUrl: dispatcher.url,
				uri: dispatcher.path + path,
				headers: {
					'Cookie': 'authToken=' + token
				},
				json: true
			}, (err, res, body) => {
				callback(diagnose(err, body), token, body);
			});
		},
		(token, body, callback) => {
			auth.logout(token, (err) => {
				callback(null, body);
			});
		}
	], (err, body) => {
		callback(err, body);
	});
}

function search(entity, limit, callback) {
	async.waterfall([
		(callback) => {
			auth.login((err, token) => {
				callback(null, token);
			});
		},
		(token, callback) => {
			request.get({
				baseUrl: dispatcher.url,
				uri: dispatcher.path + `/object/${entity}/search`,
				qs: {
					'limit': limit
				},
				headers: {
					'Cookie': 'authToken=' + token
				},
				json: true
			}, (err, res, body) => {
				callback(diagnose(err, body), token, body);
			});
		},
		(token, body, callback) => {
			auth.logout(token, (err) => {
				callback(null, body);
			});
		}
	], (err, body) => {
		callback(err, body);
	});
}

module.exports = {
	employee: {
		id: (id, callback) => object('employee', id, null, callback),
		search: (limit, callback) => search('employee', limit, callback),
		packets: (id, callback) => object('employee', id, 'packet', callback)
	},
	packet: {
		id: (id, callback) => object('packet', id, null, callback)
	},
	activity: {
		id: (id, callback) => object('activity', id, null, callback),
		search: (limit, callback) => search('activity', limit, callback)
	}
}
