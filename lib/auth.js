const https = require('https');
const request = require('request');
const querystring = require('querystring');
const diagnose = require('./diagnose');
const dispatcher = require('./dispatcher');

var auth = {
	token: null
}

/**
 * Authenticate using the resource URL provided by the dispatcher service
 * along with provided crednetials.
 */
function authenticate(callback) {
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
		var err = diagnose(err, body)

		if (err) {
			auth.token = null;
			callback(err);
		} else {
			var token = body.response.authToken;

			auth.token = token;
			callback(diagnose(err, body), token);
		}
	});
}

auth.login = authenticate

module.exports = auth;
