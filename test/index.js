const expect = require('chai').expect;
const dotenv = require('dotenv');
const dispatcher = require('../lib/dispatcher');
const authenticate = require('../lib/authenticate');

dotenv.config();

describe('SDK', function () {
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
