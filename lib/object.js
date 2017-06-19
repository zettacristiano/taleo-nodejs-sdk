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
				callback(err, token);
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
				callback(err, body);
			});
		}
	], (err, body) => {
		callback(err, body);
	});
}

function search(entity, start, limit, searchID, digicode, callback) {
	async.waterfall([
		(callback) => {
			auth.login((err, token) => {
				callback(err, token);
			});
		},
		(token, callback) => {
			request.get({
				baseUrl: dispatcher.url,
				uri: dispatcher.path + `/object/${entity}/search`,
				qs: {
					'start': start,
					'limit': limit,
					'searchId': searchID,
					'digicode': digicode
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
				callback(err, body);
			});
		}
	], (err, body) => {
		callback(err, body);
	});
}

function download(entity, id, rel, stream, callback) {
	var path = `/object/${entity}/${id}/${rel}/download`;

	async.waterfall([
		(callback) => {
			auth.login((err, token) => {
				callback(err, token);
			});
		},
		(token, callback) => {
			request.get({
				baseUrl: dispatcher.url,
				uri: dispatcher.path + path,
				headers: {
					'Cookie': 'authToken=' + token,
					'Accept': 'application/pdf'
				}
			}, (err, res) => {
				callback(diagnose(err), token);
			}).pipe(stream);
		},
		(token, callback) => {
			auth.logout(token, (err) => {
				callback(err);
			});
		}
	], (err) => {
		callback(err);
	});
}

module.exports = {
	employee: {
		id: (id, callback) => object('employee', id, null, callback),
		search: (start, limit, searchID, digicode, callback) => search('employee', start, limit, searchID, digicode, callback),
		packets: (id, callback) => object('employee', id, 'packet', callback)
	},
	packet: {
		id: (id, callback) => object('packet', id, null, callback),
		activities: (id, callback) => object('packet', id, 'activity', callback)
	},
	activity: {
		id: (id, callback) => object('activity', id, null, callback),
		search: (start, limit, searchID, digicode, callback) => search('activity', start, limit, searchID, digicode, callback),
		download: (id, stream, callback) => download('activity', id, 'form', stream, callback)
	}
}
