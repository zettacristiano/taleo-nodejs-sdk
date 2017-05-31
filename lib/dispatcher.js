const Client = require('./client');

/**
 * Get a resource URL from Taleo's Dispatcher Service. This URL is where
 * all further requests must be directed, including authentication.
 */
function dispatcher(callback) {
	var client = new Client();

	client.request({
		method: 'GET',
		hostname: 'tbe.taleo.net',
		path: `/MANAGER/dispatcher/api/v1/serviceUrl/${process.env.TALEO_COMPANY_CODE}`
	}, (err, data) => {
		callback && callback(err, data.response.URL);
	});
}

module.exports = dispatcher
