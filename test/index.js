const expect = require('chai').expect;
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
		if (!process.env.NOCK_OFF) {
			beforeEach(function () {
				require('./nock/dispatcher')();
				require('./nock/authenticate')();
			});
		}

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
			if (!process.env.NOCK_OFF) {
				require('./nock/dispatcher')();
				require('./nock/authenticate')();
			}

			dispatcher((err, url) => {
				expect(err).to.equal(null);
				expect(url).to.be.a('string');

				resourceURL = url

				done();
			});
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
