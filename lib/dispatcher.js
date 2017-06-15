const request = require('request');
const diagnose = require('./diagnose');
const url = require('url');

var dispatcher = {
	url: null,
	path: null
}

/**
 * Get a resource URL from Taleo's Dispatcher Service. This URL is where
 * all further requests must be directed, including authentication.
 */
function serviceURL(orgCode, callback) {
	if (typeof(orgCode) === 'function') {
		callback = orgCode;
		orgCode = process.env.TALEO_COMPANY_CODE;
	}

	request.get({
		baseUrl: 'https://tbe.taleo.net',
		uri: `/MANAGER/dispatcher/api/v1/serviceUrl/${orgCode}`,
		headers: {
			'Accept': 'application/json'
		},
		json: true
	}, (err, res, body) => {
		var err = diagnose(err, body);

		if (err) {
			dispatcher.href = null;
			callback(err);
		} else {
			var u = url.parse(body.response.URL);

			dispatcher.url = 'https://' + u.hostname;
			dispatcher.path = u.path;

			callback(null, dispatcher.url);
		}
	});
}

dispatcher.serviceURL = serviceURL;

module.exports = dispatcher;
