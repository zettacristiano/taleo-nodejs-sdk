const https = require('https');
const request = require('request');
const querystring = require('querystring');
const diagnose = require('./diagnose');
const dispatcher = require('./dispatcher');

/**
 * Authenticate using the resource URL provided by the dispatcher service
 * along with provided crednetials.
 */
function login(callback) {
	if (process.env.TALEO_AUTH_TOKEN) {
		return callback(null, {
			'response': {
				'authToken': process.env.TALEO_AUTH_TOKEN,
			},
			'status': {
				'success': true,
				'detail': {}
			}
		});
	}

	request.post({
		baseUrl: dispatcher.url,
		uri: dispatcher.path + '/login',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		qs: {
			'orgCode': process.env.TALEO_COMPANY_CODE,
			'userName': process.env.TALEO_USERNAME,
			'password': process.env.TALEO_PASSWORD
		},
		json: true
	}, (err, res, body) => {
		callback(diagnose(err, body), body);
	});
}

function logout(token, callback) {
	// For debugging, we allow pre-defined token
	if (process.env.TALEO_AUTH_TOKEN) {
		return callback(null, {
			'response': {},
			'status': {
				'success': true,
				'description': {}
			}
		});
	}

	request.post({
		baseUrl: dispatcher.url,
		uri: dispatcher.path + '/logout',
		headers: {
			'Cookie': 'authToken=' + token,
			'Accept': 'application/json'
		},
		json: true
	}, (err, res, body) => {
		callback(diagnose(err, body), body);
	});
}

module.exports = {
	login: login,
	logout: logout
};
