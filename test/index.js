const expect = require('chai').expect;
const nock = require('nock');
const dotenv = require('dotenv');
const dispatcher = require('../lib/dispatcher');
const auth = require('../lib/auth');
const diagnose = require('../lib/diagnose');

dotenv.config();

describe('SDK', function () {
	describe('diagnose', function () {
		it('detects error responses', function (done) {
			const err = diagnose(null, {
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
			const err = diagnose(null, {
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

		it('detects request errors', function (done) {
			const err = diagnose(new Error('Error message'));

			expect(err).to.exist;
			expect(err).to.be.a('string');
			expect(err).to.equal('Error message');

			done();
		});
	});

	describe('dispatcher', function () {
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

			dispatcher.serviceURL((err, url) => {
				expect(err).to.equal(null);
				expect(url).to.be.a('string');

				done();
			});
		});
	});

	describe('auth', function () {
		var serviceURL = null;

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

			dispatcher.serviceURL((err, url) => {
				expect(err).to.equal(null);
				expect(url).to.be.a('string');

				serviceURL = url

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
			auth.login((err, token) => {
				expect(err).to.equal(null);
				expect(token).to.be.a('string');
				expect(auth.token).to.exist;
				expect(auth.token).to.equal(token);

				done();
			});
		});

		nock('https://test.service.url/path')
			.post('/login')
			.query({
				orgCode: process.env.TALEO_COMPANY_CODE,
				userName: process.env.TALEO_USERNAME,
				password: process.env.TALEO_PASSWORD
			}).reply(401, {
				'response': {
				},
				'status': {
					'success': false,
					'detail': {
						'errorcode': 33,
						'errormessage': 'An authentication error'
					}
				}
			});

		it('handles authentication failure', function (done) {
			auth.login((err, token) => {
				expect(err).to.exist;
				expect(token).to.not.exist;
				expect(auth.token).to.equal(null);

				done();
			});
		});
	});
});
