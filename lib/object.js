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
			auth.login((err, body) => {
				err = diagnose(err, body);

				if (err) {
					return callback(new Error(err));
				} else {
					return callback(null, body.response.authToken);
				}
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
				err = diagnose(err, body);

				if (err) {
					return callback(new Error(err));
				} else {
					return callback(null, token, body);
				}
			});
		},
		(token, body, callback) => {
			auth.logout(token, (err) => {
				err = diagnose(err, body);

				if (err) {
					return callback(new Error(err));
				} else {
					return callback(null, body);
				}
			});
		}
	], (err, body) => {
		callback(diagnose(err), body);
	});
}

function search(entity, start, limit, searchID, digicode, callback) {
	async.waterfall([
		(callback) => {
			auth.login((err, body) => {
				err = diagnose(err, body);

				if (err) {
					return callback(new Error(err));
				} else {
					return callback(null, body.response.authToken);
				}
			});
		},
		(token, callback) => {
			request.get({
				baseUrl: dispatcher.url,
				uri: dispatcher.path + `/object/${entity}/search`,
				qs: {
					// limit can be zero, start can't so we'll assume limit is always defined
					'limit': limit,
					'start': start || undefined,
					'searchId': searchID || undefined,
					'digicode': digicode || undefined
				},
				headers: {
					'Cookie': 'authToken=' + token
				},
				json: true
			}, (err, res, body) => {
				err = diagnose(err, body);

				if (err) {
					return callback(new Error(err));
				} else {
					return callback(null, token, body);
				}
			});
		},
		(token, body, callback) => {
			auth.logout(token, (err) => {
				err = diagnose(err, body);

				if (err) {
					return callback(new Error(err));
				} else {
					return callback(null, body);
				}
			});
		}
	], (err, body) => {
		callback(diagnose(err), body);
	});
}

function download(entity, id, rel, stream, callback) {
	var path = `/object/${entity}/${id}/${rel}/download`;

	async.waterfall([
		(callback) => {
			auth.login((err, body) => {
				err = diagnose(err, body);

				if (err) {
					return callback(new Error(err));
				} else {
					return callback(null, body.response.authToken);
				}
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
				err = diagnose(err);

				if (err) {
					err = new Error(err);
					return callback(new Error(err));
				} else {
					return callback(null, token);
				}
			}).pipe(stream);
		},
		(token, callback) => {
			auth.logout(token, (err, body) => {
				err = diagnose(err, body);

				if (err) {
					return callback(new Error(err));
				} else {
					return callback(null);
				}
			});
		}
	], (err) => {
		callback(diagnose(err));
	});
}

module.exports = {
	object: object,
	search: search,
	download: download,
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
