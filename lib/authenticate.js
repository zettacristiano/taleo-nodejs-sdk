const https = require('https');
const url = require('url');
const querystring = require('querystring');

/**
 * Authenticate using the resource URL provided by the dispatcher service
 * along with provided crednetials.
 */
function authenticate(resourceURL, username, password, cc, callback) {
	var ru = url.parse(resourceURL);
	var qs = querystring.stringify({
		'orgCode': cc,
		'userName': username,
		'password': password
	});

	var req = https.request({
		method: 'POST',
		hostname: ru.hostname,
		path: ru.path + `/login?${qs}`
	}, (res) => {
		var str = '';

		res.setEncoding('utf8');

		res.on('data', (chunk) => {
			str += chunk;
		}).on('end', () => {
			var data = JSON.parse(str);

			callback && callback(data.response.authToken);
		});
	});

	req.on('error', (err) => {
		console.log(err);
	});

	req.end();
}

module.exports = authenticate;
