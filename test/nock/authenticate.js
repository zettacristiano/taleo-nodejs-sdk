const nock = require('nock');

module.exports = function () {
	nock('https://test.service.url/path')
		.post('/login')
		.query({
			orgCode: process.env.TALEO_COMPANY_CODE,
			userName: process.env.TALEO_USERNAME,
			password: process.env.TALEO_PASSWORD
		}).reply(200, {
			'response': {
				'authToken': 'webapi2-abcdefghijklmnop'
			},
			'status': {
				'success': true,
				'detail': {}
			}
		});
}
