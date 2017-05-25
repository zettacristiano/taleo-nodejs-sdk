var https = require('https');

/**
 * Get a resource URL from Taleo's Dispatcher Service. This URL is where
 * all further requests must be directed, including authentication.
 */
function dispatcher(cc, callback) {
	var req = https.request({
		method: 'GET',
		hostname: 'tbe.taleo.net',
		path: `/MANAGER/dispatcher/api/v1/serviceUrl/${cc}`
	}, (res) => {
		var str = '';

		res.setEncoding('utf8')

		res.on('data', (chunk) => {
			str += chunk;
		}).on('end', () => {
			var data = JSON.parse(str);

			callback && callback(data.response.URL);
		});
	});

	req.on('error', (err) => {
		console.log(err);
	});

	req.end();
}

module.exports = dispatcher
