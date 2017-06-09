const expect = require('chai').expect;
const nock = require('nock');
const url = require('url');
const dotenv = require('dotenv');
const dispatcher = require('../lib/dispatcher');
const auth = require('../lib/auth');
const diagnose = require('../lib/diagnose');
const employee = require('../lib/employee');

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
		it('returns resource URL', function (done) {
			this.timeout(5000);

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

		it('returns auth token', function (done) {
			nock(dispatcher.url)
				.post(dispatcher.path + '/login')
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

			auth.login((err, token) => {
				expect(err).to.equal(null);
				expect(token).to.be.a('string');
				expect(auth.token).to.exist;
				expect(auth.token).to.equal(token);

				done();
			});
		});

		if (!process.env.NOCK_OFF) {
			it('handles authentication failure', function (done) {
				nock(dispatcher.url)
					.post(dispatcher.path + '/login')
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

				auth.login((err, token) => {
					expect(err).to.exist;
					expect(token).to.not.exist;
					expect(auth.token).to.equal(null);

					done();
				});
			});
		}
	});

	describe('employee', function () {
		before(function (done) {
			dispatcher.serviceURL((err, url) => {
				auth.login((err, token) => {
					done();
				});
			});
		});

		it('gets employee count', function (done) {
			nock(dispatcher.url)
				.matchHeader('Cookie', 'authToken=' + auth.token)
				.get(dispatcher.path + '/object/employee/search')
				.query({
					'limit': 0
				})
				.reply(200, {
					'response': {
						'pagination': {
							'total': 5
						}
					},
					'status': {
						'success': true,
						'detail': {}
					}
				});

			employee.count((err, count) => {
				expect(err).to.not.exist;
				expect(count).to.exist;
				expect(count).to.be.a('number');

				done();
			});
		});

		it('generates search pages', function (done) {
			nock(dispatcher.url)
				.matchHeader('Cookie', 'authToken=' + auth.token)
				.get(dispatcher.path + '/object/employee/search')
				.query(function (q) {
					return q.limit !== 0;
				})
				.reply(200, function (uri, body, callback) {
					var base = dispatcher.url + dispatcher.path;
					var limit = url.parse(base + uri, true).limit;

					callback(null, {
						'response': {
							'pagination': {
								'next': `${base}/object/employee/search?searchId=12345&start=21&limit=${limit}&digicode=abcdefghijklmnop%3D`,
								'total': 100,
								'self': `${base}/object/employee/search?searchId=12345&start=21&limit=${limit}&digicode=abcdefghijklmnop%3D`
							},
							'searchResults': [
							]
						},
						'status': {
							'success': true,
							'detail': {}
						}
					});
				});

			employee.pages(20, (err, pages) => {
				expect(err).to.not.exist;
				expect(pages).to.exist;

				done();
			});
		});
	});
});
