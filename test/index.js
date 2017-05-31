const expect = require('chai').expect;
const dotenv = require('dotenv');
const dispatcher = require('../lib/dispatcher');

dotenv.config();

describe('GET resource URL', function () {
	it('returns resource URL', function (done) {
		this.timeout(5000);

		dispatcher((err, resourceURL) => {
			expect(err).to.equal(null);
			expect(resourceURL).to.be.a('string');

			done();
		});
	});
});
