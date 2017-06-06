const https = require('https');
const request = require('request');
const url = require('url');
const querystring = require('querystring');
const diagnose = require('./diagnose');

/**
 * Authenticate using the resource URL provided by the dispatcher service
 * along with provided crednetials.
 */
function authenticate(resourceURL,  callback) {
	var ru = url.parse(resourceURL);

	request.post({
		baseUrl: `${ru.protocol}//${ru.hostname}`,
		uri: ru.path + '/login',
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
		callback && callback(diagnose(body), body.response.authToken);
	});
}

module.exports = authenticate;
