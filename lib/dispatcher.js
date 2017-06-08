const request = require('request');
const diagnose = require('./diagnose');

var dispatcher = {
	href: null
}

/**
 * Get a resource URL from Taleo's Dispatcher Service. This URL is where
 * all further requests must be directed, including authentication.
 */
function serviceURL(callback) {
	request.get({
		baseUrl: 'https://tbe.taleo.net',
		uri: `/MANAGER/dispatcher/api/v1/serviceUrl/${process.env.TALEO_COMPANY_CODE}`,
		headers: {
			'Accept': 'application/json'
		},
		json: true
	}, (err, res, body) => {
		callback(diagnose(err, body), body && body.response.URL);

		dispatcher.href = body.response.URL;
	});
}

dispatcher.serviceURL = serviceURL;

module.exports = dispatcher;
