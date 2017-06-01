const nock = require('nock');

module.exports = function () {
	nock('https://tbe.taleo.net')
		.get(`/MANAGER/dispatcher/api/v1/serviceUrl/${process.env.TALEO_COMPANY_CODE}`)
		.reply(200, {
			'response': {
				'URL': 'https://test.service.url/path'
			},
			'status': {
				'success': true,
				'detail': {}
			}
		});
}
