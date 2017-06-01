const assert = require('assert');
const https = require('https');
const querystring = require('querystring');

function Client() {
}

Client.prototype.request = function (options, callback) {
	var method = options.method || 'GET';
	var params = options.params ? `?${querystring.stringify(options.params)}` : '';
	var hostname = options.hostname;

	var req = https.request({
		method: method,
		hostname: hostname,
		path: options.path + params
	}, (res) => {
		var body = '';

		res.setEncoding('utf8');
		res.on('data', (chunk) => {
			body += chunk;
		}).on('end', () => {
			var data = JSON.parse(body);

			callback && callback(this.diagnose(data), data);
		});
	});

	req.on('error', (err) => {
		callback && callback(err);
	});

	req.end();
}

Client.prototype.diagnose = function (data) {
	assert(data && data.status, 'Malformed request');

	if (data.status.success === false) {
		return `${data.status.detail.errorcode} ${data.status.detail.errormessage}`;
	} else {
		return null;
	}
}

module.exports = Client;
