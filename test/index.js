const expect = require('chai').expect;
const async = require('async');
const nock = require('nock');
const url = require('url');
const dotenv = require('dotenv');
const dispatcher = require('../lib/dispatcher');
const auth = require('../lib/auth');
const diagnose = require('../lib/diagnose');
const employee = require('../lib/employee');
const packet = require('../lib/packet');
const activity = require('../lib/activity');
const status = require('../lib/object/status');

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

		if (!process.env.NOCK_OFF) {
			it('get by ID', function (done) {
				nock(dispatcher.url)
					.matchHeader('Cookie', 'authToken=' + auth.token)
					.get(dispatcher.path + '/object/employee/10')
					.reply(200, {
						'response': {
							'employee': {
								'candidate': 1234567,
								'address': '12345 N. 1st St.',
								'city': 'Bakersfield',
								'state': 'California',
								'zipCode': 93313,
								'firstName': 'John',
								'middleInitial': 'U',
								'lastName': 'Doe',
								'jobTitle': 'Missing',
								'email': 'johndoe@email.com',
								'employeeNumber': 'EMP12345',
								'employeeId': 10,
								'hired': '2000-01-01',
								'birthdate': '1970-01-01',
								'salary': 100000,
								'ssn': '123456789'
							}
						},
						'status': {
							'success': true,
							'detail': {}
						}
					});

				employee.byID(10, (err, emp) => {
					expect(err).to.not.exist;
					expect(emp).to.exist;
					expect(emp.id).to.be.a('number');

					done();
				});
			});
		}

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

	describe('packet', function () {
		if (!process.env.NOCK_OFF) {
			it('get by ID', function (done) {
				nock(dispatcher.url)
					.matchHeader('Cookie', 'authToken=' + auth.token)
					.get(dispatcher.path + '/object/packet/10')
					.reply(200, {
						'response': {
							'packet': {
								'activitiesCompleted': 0,
								'activitiesCount': 10,
								'createdById': 1,
								'creationDate': '2000-01-01',
								'dueDate': '2000-01-15',
								'employeeId': 10,
								'activityPacketId': 10,
								'ownerId': 1,
								'status': 1,
								'usageCxt': 'ON_BOARDING',
								'title': 'John Doe Hiring Packet'
							}
						},
						'status': {
							'success': true,
							'detail': {}
						}
					});

				packet.byID(10, (err, packet) => {
					expect(err).to.not.exist;
					expect(packet).to.exist;

					done();
				});
			});

			it('', function (done) {
				nock(dispatcher.url)
					.matchHeader('Cookie', 'authToken=' + auth.token)
					.get(dispatcher.path + '/object/packet/10')
					.reply(200, {
						'response': {
							'packet': {
								'activitiesCompleted': 0,
								'activitiesCount': 10,
								'createdById': 1,
								'creationDate': '2000-01-01',
								'dueDate': '2000-01-15',
								'employeeId': 10,
								'activityPacketId': 10,
								'ownerId': 1,
								'status': 1,
								'usageCxt': 'ON_BOARDING',
								'title': 'John Doe Hiring Packet'
							}
						},
						'status': {
							'success': true,
							'detail': {}
						}
					});

				nock(dispatcher.url)
					.matchHeader('Cookie', 'authToken=' + auth.token)
					.get(dispatcher.path + '/object/packet/12')
					.reply(200, {
						'response': {
							'packet': {
								'activitiesCompleted': 7,
								'activitiesCount': 10,
								'createdById': 1,
								'creationDate': '2000-01-01',
								'dueDate': '2000-01-15',
								'employeeId': 12,
								'activityPacketId': 12,
								'ownerId': 1,
								'status': 2,
								'usageCxt': 'ON_BOARDING',
								'title': 'Rupert Doe Hiring Packet'
							}
						},
						'status': {
							'success': true,
							'detail': {}
						}
					});

				nock(dispatcher.url)
					.matchHeader('Cookie', 'authToken=' + auth.token)
					.get(dispatcher.path + '/object/packet/15')
					.reply(200, {
						'response': {
							'packet': {
								'activitiesCompleted': 10,
								'activitiesCount': 10,
								'createdById': 1,
								'creationDate': '2000-01-01',
								'dueDate': '2000-01-15',
								'employeeId': 15,
								'activityPacketId': 15,
								'ownerId': 1,
								'status': 3,
								'usageCxt': 'ON_BOARDING',
								'title': 'Jim Doe Hiring Packet'
							}
						},
						'status': {
							'success': true,
							'detail': {}
						}
					});

				async.waterfall([
					(callback) => {
						packet.byID(10, (err, packet) => {
							expect(err).to.not.exist;
							expect(packet).to.exist;
							expect(packet.isComplete()).to.equal(false);

							callback(null);
						});
					},
					(callback) => {
						packet.byID(12, (err, packet) => {
							expect(err).to.not.exist;
							expect(packet).to.exist;
							expect(packet.isComplete()).to.equal(false);

							callback(null);
						});
					},
					(callback) => {
						packet.byID(15, (err, packet) => {
							expect(err).to.not.exist;
							expect(packet).to.exist;
							expect(packet.isComplete()).to.equal(true);

							callback(null);
						});
					}
				], (err) => {
					expect(err).to.not.exist;

					done();
				});
			});
		}
	});

	describe('activity', function () {
		before(function (done) {
			auth.login((err, token) => {
				done();
			});
		});

		if (!process.env.NOCK_OFF) {
			it('get by ID', function (done) {
				nock(dispatcher.url)
					.matchHeader('Cookie', 'authToken=' + auth.token)
					.get(dispatcher.path + '/object/activity/1')
					.reply(200, {
						'response': {
							'activity': {
								'id': 1,
								'dueDate': '2000-01-03',
								'item': 'Activity Item',
								'activityDesc': 'Activity Description',
								'title': 'Activity Title',
								'status': 1
							}
						},
						'status': {
							'success': true,
							'detail': {}
						}
					});

				activity.byID(1, (err, activity) => {
					expect(err).to.not.exist;
					expect(activity).to.exist;
					expect(activity.id).to.equal(1);

					done();
				});
			});
		}

		it('get activity count', function (done) {
			nock(dispatcher.url)
				.matchHeader('Cookie', 'authToken=' + auth.token)
				.get(dispatcher.path + '/object/activity/search')
				.query({
					'limit': 0
				})
				.reply(200, function (uri, body, callback) {
					var base = dispatcher.url + dispatcher.path;
					var limit = url.parse(base + uri, true).limit;

					callback(null, {
						'response': {
							'pagination': {
								'total': 1,
								'self': `${base}/object/activity/search?searchId=9999&start=1&limit=${limit}&digicode=zzzyxwvu%3D`,
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

			activity.count((err, total) => {
				expect(err).to.not.exist;
				expect(total).to.exist;
				expect(total).to.be.a('number');

				done();
			});
		});
	});

	describe('employee - packet', function () {
		var emp = null;

		before(function (done) {
			nock(dispatcher.url)
				.matchHeader('Cookie', 'authToken=' + auth.token)
				.get(dispatcher.path + '/object/employee/10')
				.reply(200, {
					'response': {
						'employee': {
							'candidate': 1234567,
							'address': '12345 N. 1st St.',
							'city': 'Bakersfield',
							'state': 'California',
							'zipCode': 93313,
							'firstName': 'John',
							'middleInitial': 'U',
							'lastName': 'Doe',
							'jobTitle': 'Missing',
							'email': 'johndoe@email.com',
							'employeeNumber': 'EMP12345',
							'employeeId': 10,
							'hired': '2000-01-01',
							'birthdate': '1970-01-01',
							'salary': 100000,
							'ssn': '123456789'
						}
					},
					'status': {
						'success': true,
						'detail': {}
					}
				});

			employee.byID(10, (err, res) => {
				emp = res;

				done();
			});
		});

		if (!process.env.NOCK_OFF) {
			it('get employee packets', function (done) {
				// Nock employee - packet relationship
				nock(dispatcher.url)
					.matchHeader('Cookie', 'authToken=' + auth.token)
					.get(dispatcher.path + '/object/employee/10/packet')
					.reply(200, {
						'response': {
							'activityPackets': [
								{
									'packet': {
										'activitiesCompleted': 0,
										'activitiesCount': 10,
										'createdById': 1,
										'creationDate': '2000-01-01',
										'dueDate': '2000-01-15',
										'employeeId': 10,
										'activityPacketId': 10,
										'ownerId': 1,
										'status': 1,
										'usageCxt': 'ON_BOARDING',
										'title': 'John Doe Hiring Packet'
									}
								},
								{
									'packet': {
										'activitiesCompleted': 0,
										'activitiesCount': 10,
										'createdById': 2,
										'creationDate': '2000-01-02',
										'dueDate': '2000-01-16',
										'employeeId': 10,
										'activityPacketId': 11,
										'ownerId': 1,
										'status': 1,
										'usageCxt': 'ON_BOARDING',
										'title': 'John Doe Hiring Packet (Fixed)'
									}
								}
							]
						},
						'status': {
							'success': true,
							'detail': {}
						}
					});
				// Nock each packet
				nock(dispatcher.url)
					.matchHeader('Cookie', 'authToken=' + auth.token)
					.get(dispatcher.path + '/object/packet/10')
					.reply(200, {
						'response': {
							'packet': {
								'activitiesCompleted': 0,
								'activitiesCount': 10,
								'createdById': 1,
								'creationDate': '2000-01-01',
								'dueDate': '2000-01-15',
								'employeeId': 10,
								'activityPacketId': 10,
								'ownerId': 1,
								'status': 1,
								'usageCxt': 'ON_BOARDING',
								'title': 'John Doe Hiring Packet'
							}
						},
						'status': {
							'success': true,
							'detail': {}
						}
					});
				nock(dispatcher.url)
					.matchHeader('Cookie', 'authToken=' + auth.token)
					.get(dispatcher.path + '/object/packet/11')
					.reply(200, {
						'response': {
							'packet': {
								'activitiesCompleted': 0,
								'activitiesCount': 10,
								'createdById': 2,
								'creationDate': '2000-01-02',
								'dueDate': '2000-01-16',
								'employeeId': 10,
								'activityPacketId': 11,
								'ownerId': 1,
								'status': 1,
								'usageCxt': 'ON_BOARDING',
								'title': 'John Doe Hiring Packet (Fixed)'
							}
						},
						'status': {
							'success': true,
							'detail': {}
						}
					});

				employee.packets(emp, (err, packets) => {
					expect(err).to.not.exist;
					expect(packets).to.exist;
					expect(packets.length).to.equal(2);

					done();
				});
			});
		}
	});
});
