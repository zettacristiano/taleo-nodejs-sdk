const https = require('https');
const url = require('url');
const querystring = require('querystring');
const Client = require('./client');

/**
 * Authenticate using the resource URL provided by the dispatcher service
 * along with provided crednetials.
 */
function authenticate(resourceURL,  callback) {
	var client = new Client();
	var ru = url.parse(resourceURL);

	client.request({
		method: 'POST',
		hostname: ru.hostname,
		path: ru.path + '/login',
		params: {
			'orgCode': process.env.TALEO_COMPANY_CODE,
			'userName': process.env.TALEO_USERNAME,
			'password': process.env.TALEO_PASSWORD
		}
	}, (err, data) => {
		callback && callback(err, data.response.authToken);
	});
}

module.exports = authenticate;
