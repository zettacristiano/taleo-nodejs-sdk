const assert = require('assert');
const dotenv = require('dotenv');

dotenv.config();

const companyCode = process.env.TALEO_COMPANY_CODE;
const username = process.env.TALEO_USERNAME;
const password = process.env.TALEO_PASSWORD;

assert(companyCode, 'COMPANY_CODE not defined');
assert(username, 'USERNAME not defined');
assert(password, 'PASSWORD not defined');

const dispatcher = require('../lib/dispatcher');
const authenticate = require('../lib/authenticate');

dispatcher((err, resourceURL) => {
	console.log(err || resourceURL);

	authenticate(resourceURL, (err, token) => {
		console.log(err || token);
	});
});
