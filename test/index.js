const assert = require('assert');
const dotenv = require('dotenv');

dotenv.config();

const cc = process.env.TALEO_COMPANY_CODE;
const username = process.env.TALEO_USERNAME;
const password = process.env.TALEO_PASSWORD;

assert(cc, 'COMPANY_CODE not defined');
assert(username, 'USERNAME not defined');
assert(password, 'PASSWORD not defined');

var dispatcher = require('../lib/dispatcher.js');
var authenticate = require('../lib/authenticate.js');

dispatcher(cc, (resourceURL) => {
	console.log(resourceURL);

	authenticate(resourceURL, username, password, cc, (token) => {
		console.log(token);
	});
});
