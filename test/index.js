const expect = require('chai').expect;
const nock = require('nock');
const dotenv = require('dotenv');
const dispatcher = require('../lib/dispatcher');
const authenticate = require('../lib/authenticate');
const diagnose = require('../lib/diagnose');

dotenv.config();

describe('SDK', function () {
	describe('diagnose() Taleo responses', function () {
		it('detects error responses', function (done) {
			const err = diagnose({
				'status': {
					'success': false,
					'detail': {
						'errorcode': 100,
						'errormessage': 'An API error'
					}
				}
			});

			expect(err).to.exist;
			expect(err).to.be.a('string');
			expect(err).to.equal('100 An API error');

			done();
		});

		it('detects success responses', function (done) {
			const err = diagnose({
				'response': {
				},
				'status': {
					'success': true,
					'detail': {
					}
				}
			});

			expect(err).to.equal(null);

			done();
		});
	});

	describe('Get resource URL', function () {
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

		it('returns resource URL', function (done) {
			this.timeout(5000);

			dispatcher((err, resourceURL) => {
				expect(err).to.equal(null);
				expect(resourceURL).to.be.a('string');

				done();
			});
		});
	});

	describe('Get auth token', function () {
		var resourceURL = null;

		// Taleo Stage is slow
		this.timeout(5000);

		before(function (done) {
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

			dispatcher((err, url) => {
				expect(err).to.equal(null);
				expect(url).to.be.a('string');

				resourceURL = url

				done();
			});
		});

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

		it('returns auth token', function (done) {
			authenticate(resourceURL, (err, token) => {
				expect(err).to.equal(null);
				expect(token).to.be.a('string');

				done();
			});
		});
	});
});
