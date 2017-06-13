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
		callback(diagnose(err, body), body && body.response.authToken);
	});
}

function logout(token, callback) {
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
