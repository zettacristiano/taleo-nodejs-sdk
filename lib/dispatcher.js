const request = require('request');
const diagnose = require('./diagnose');

/**
 * Get a resource URL from Taleo's Dispatcher Service. This URL is where
 * all further requests must be directed, including authentication.
 */
function dispatcher(callback) {
	request.get({
		baseUrl: 'https://tbe.taleo.net',
		uri: `/MANAGER/dispatcher/api/v1/serviceUrl/${process.env.TALEO_COMPANY_CODE}`,
		headers: {
			'Accept': 'application/json'
		},
		json: true
	}, (err, res, body) => {
		callback && callback(diagnose(body), body.response.URL);
	});
}

module.exports = dispatcher
