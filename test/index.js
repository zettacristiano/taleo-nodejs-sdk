const Taleo = require('../');
const async = require('async');
const chai = require('chai');
const expect = chai.expect;
const nock = require('nock');
const url = require('url');
const dispatcher = require('../lib/dispatcher');
const auth = require('../lib/auth');
const diagnose = require('../lib/diagnose');
const employee = require('../lib/employee');
const packet = require('../lib/packet');
const activity = require('../lib/activity');
const location = require('../lib/location');
const generate = require('../lib/generate');
const status = require('../lib/object/status');

// Chai config
chai.use(require('chai-fs'));

before(function (done) {
	nock('https://tbe.taleo.net')
		.persist()
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

	nock('https://test.service.url')
		.persist()
		.post('/path/login')
		.query({
			orgCode: process.env.TALEO_COMPANY_CODE,
			userName: process.env.TALEO_USERNAME,
			password: process.env.TALEO_PASSWORD
		}).reply(200, {
			'response': {
				'authToken': process.env.TALEO_AUTH_TOKEN || 'webapi2-abcdefghijklmnop'
			},
			'status': {
				'success': true,
				'detail': {}
			}
		});

	nock('https://test.service.url')
		.persist()
		.post('/path/logout')
		.reply(200, {
			'response': {
			},
			'status': {
				'success': true,
				'detail': {}
			}
		});

	done();
});

beforeEach(function (done) {
	dispatcher.serviceURL((err, url) => {
		done();
	});
});

describe('Utility and Helper Functions', function () {
	describe('generate entities', function () {
		it('Employees', function (done) {
			var list = generate.entities('badentity', []);

			expect(list).to.not.exist;

			done();
		});
	});
});

describe('Taleo Dispatcher Service', function () {
	nock('https://tbe.taleo.net')
		.persist()
		.get(`/MANAGER/dispatcher/api/v1/serviceUrl/BAD_ORG_CODE`)
		.reply(200, {
			'response': {
			},
			'status': {
				'success': false,
				'detail': {
					'errormessage': 'Requested resource not found',
					'error': 'Requested resource not found',
					'operation': 'GetUrlByOrgCode',
					'errorcode': 500
				}
			}
		});

	it('error service URL request', function (done) {
		dispatcher.serviceURL('BAD_ORG_CODE', (err, url) => {
			expect(err).to.exist;
			expect(err).to.be.an('error');
			expect(url).to.not.exist;

			done();
		});
	});
});

describe('Taleo Authentication', function () {
	// Taleo Stage is slow
	this.timeout(5000);

	it('login/logout', function (done) {
		auth.login((err, body) => {
			expect(err).to.equal(null);
			expect(body).to.exist;

			auth.logout(body.response.authToken, (err) => {
				expect(err).to.equal(null);

				if (!process.env.NOCK_OFF) {
					var authToken = 'webapi2-predefinedabcd';

					// Toggle predefined token
					if (process.env.TALEO_AUTH_TOKEN)
						process.env.TALEO_AUTH_TOKEN = null;
					else
						process.env.TALEO_AUTH_TOKEN = authToken;

					auth.login((err, body) => {
						expect(err).to.not.exist;
						expect(body).to.exist;

						auth.logout(body.response.authToken, (err) => {
							expect(err).to.not.exist;

							process.env.TALEO_AUTH_TOKEN = null;

							done();
						});
					});
				} else {
					done();
				}
			});
		});
	});
});

describe('Taleo Object API', function () {
	this.timeout(30000);

	beforeEach(function (done) {
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
			expect(err).to.be.an('error');
			expect(err.message).to.equal('100 An API error');

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
			expect(err).to.be.an('error');
			expect(err.message).to.equal('Error message');

			done();
		});
	});

	describe('employee', function () {
		it('gets employee count', function (done) {
			nock(dispatcher.url)
				.matchHeader('Cookie', function (val) {
					return val.indexOf('authToken=') > -1;
				})
				.get(dispatcher.path + '/object/employee/search')
				.query(function (q) {
					return q.limit === '0';
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
					.matchHeader('Cookie', function (val) {
						return val.indexOf('authToken=') > -1;
					})
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
			this.timeout(30000);

			nock(dispatcher.url)
				.matchHeader('Cookie', function (val) {
					return val.indexOf('authToken=') > -1;
				})
				.get(dispatcher.path + '/object/employee/search')
				.query(function (q) {
					return q.limit === '0';
				})
				.reply(200, function (uri, body, callback) {
					var base = dispatcher.url + dispatcher.path;

					callback(null, {
						'response': {
							'pagination': {
								'total': 5,
								'self': `${base}/object/employee/search?searchId=12345&start=1&limit=5&digicode=abcdefghijklmnop%3D`
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

			nock(dispatcher.url)
				.matchHeader('Cookie', function (val) {
					return val.indexOf('authToken=') > -1;
				})
				.get(dispatcher.path + '/object/employee/search')
				.query(function (q) {
					return q.start === '1' && q.limit === '5' && q.searchId !== undefined && q.digicode !== undefined;
				})
				.reply(200, function (uri, body, callback) {
					var base = dispatcher.url + dispatcher.path;

					callback(null, {
						'response': {
							'pagination': {
								'total': 5,
								'self': `${base}/object/employee/search?searchId=12345&start=1&limit=5&digicode=abcdefghijklmnop%3D`
							},
							'searchResults': [
								{
									'employee': {
										'candidate': 1,
										'address': '555 N. 1st St.',
										'city': 'Bakersfield',
										'state': 'California',
										'zipCode': 93313,
										'firstName': 'Jim',
										'middleInitial': 'U',
										'lastName': 'Doe',
										'jobTitle': 'Missing',
										'email': 'johndoe@email.com',
										'employeeNumber': 'EMP12345',
										'employeeId': 111,
										'hired': '2000-01-01',
										'birthdate': '1970-01-01',
										'salary': 100000,
										'ssn': '567890123'
									}
								},
								{
									'employee': {
										'candidate': 2,
										'address': '444 N. 1st St.',
										'city': 'Bakersfield',
										'state': 'California',
										'zipCode': 93313,
										'firstName': 'John',
										'middleInitial': 'U',
										'lastName': 'Doe',
										'jobTitle': 'Missing',
										'email': 'johndoe@email.com',
										'employeeNumber': 'EMP12345',
										'employeeId': 222,
										'hired': '2000-01-01',
										'birthdate': '1970-01-01',
										'salary': 100000,
										'ssn': '45789012'
									}
								},
								{
									'employee': {
										'candidate': 3,
										'address': '333 N. 1st St.',
										'city': 'Bakersfield',
										'state': 'California',
										'zipCode': 93313,
										'firstName': 'Jerry',
										'middleInitial': 'U',
										'lastName': 'Doe',
										'jobTitle': 'Missing',
										'email': 'johndoe@email.com',
										'employeeNumber': 'EMP12345',
										'employeeId': 333,
										'hired': '2000-01-01',
										'birthdate': '1970-01-01',
										'salary': 100000,
										'ssn': '345678901'
									}
								},
								{
									'employee': {
										'candidate': 4,
										'address': '222 N. 1st St.',
										'city': 'Bakersfield',
										'state': 'California',
										'zipCode': 93313,
										'firstName': 'James',
										'middleInitial': 'U',
										'lastName': 'Doe',
										'jobTitle': 'Missing',
										'email': 'johndoe@email.com',
										'employeeNumber': 'EMP12345',
										'employeeId': 444,
										'hired': '2000-01-01',
										'birthdate': '1970-01-01',
										'salary': 100000,
										'ssn': '234567890'
									}
								},
								{
									'employee': {
										'candidate': 5,
										'address': '111 N. 1st St.',
										'city': 'Bakersfield',
										'state': 'California',
										'zipCode': 93313,
										'firstName': 'Jacob',
										'middleInitial': 'U',
										'lastName': 'Doe',
										'jobTitle': 'Missing',
										'email': 'johndoe@email.com',
										'employeeNumber': 'EMP12345',
										'employeeId': 555,
										'hired': '2000-01-01',
										'birthdate': '1970-01-01',
										'salary': 100000,
										'ssn': '123456789'
									}
								}
							]
						},
						'status': {
							'success': true,
							'detail': {}
						}
					});
				});

			employee.pages(5, (err, pages) => {
				expect(err).to.not.exist;
				expect(pages).to.exist;

				for (var i = 0; i < pages.length; ++i) {
					pages[i].read((err, employees) => {
						expect(err).to.not.exist;
						expect(employees).to.exist;
						expect(employees.length).to.be.a('number');
					});
				}

				done();
			});
		});
	});

	describe('packet', function () {
		if (!process.env.NOCK_OFF) {
			it('get by ID', function (done) {
				nock(dispatcher.url)
					.matchHeader('Cookie', function (val) {
						return val.indexOf('authToken=') > -1;
					})
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

			it('search', function (done) {
				nock(dispatcher.url)
					.matchHeader('Cookie', function (val) {
						return val.indexOf('authToken=') > -1;
					})
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
					.matchHeader('Cookie', function (val) {
						return val.indexOf('authToken=') > -1;
					})
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
					.matchHeader('Cookie', function (val) {
						return val.indexOf('authToken=') > -1;
					})
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
		if (!process.env.NOCK_OFF) {
			it('get by ID', function (done) {
				nock(dispatcher.url)
					.matchHeader('Cookie', function (val) {
						return val.indexOf('authToken=') > -1;
					})
					.get(dispatcher.path + '/object/activity/1')
					.reply(200, {
						'response': {
							'activity': {
								'id': 1,
								'dueDate': '2000-01-03',
								'item': 'Activity Item',
								'activityDesc': 'Activity Description',
								'title': 'Activity Title',
								'status': 1,
								'relationshipUrls': {
								}
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

			it('download activity form PDF', function (done) {
				nock(dispatcher.url)
					.matchHeader('Cookie', function (val) {
						return val.indexOf('authToken=') > -1;
					})
					.get(dispatcher.path + '/object/activity/1')
					.reply(200, {
						'response': {
							'activity': {
								'id': 1,
								'dueDate': '2000-01-03',
								'assignee': [
									1
								],
								'item': 'Activity Item',
								'activityDesc': 'Activity Description',
								'title': 'Activity Title',
								'status': 3,
								'relationshipUrls': {
								}
							}
						},
						'status': {
							'success': true,
							'detail': {}
						}
					});

				nock(dispatcher.url)
					.matchHeader('Accept', 'application/pdf')
					.matchHeader('Cookie', function (val) {
						return val.indexOf('authToken=') > -1;
					})
					.get(dispatcher.path + '/object/activity/1/form/download')
					.replyWithFile(200, __dirname + '/test.pdf');

				activity.byID(1, (err, actv) => {
					activity.download(actv, 'test/1.pdf', (err) => {
						expect(err).to.not.exist;
						expect('test/1.pdf').to.be.a.file();

						done();
					});
				});
			});

			it('disallow incomplete activity download', function (done) {
				nock(dispatcher.url)
					.matchHeader('Cookie', function (val) {
						return val.indexOf('authToken=') > -1;
					})
					.get(dispatcher.path + '/object/activity/2')
					.reply(200, {
						'response': {
							'activity': {
								'id': 2,
								'dueDate': '2000-01-03',
								'assignee': [
									2
								],
								'item': 'Activity Item',
								'activityDesc': 'Activity Description',
								'title': 'Activity Title',
								'status': 1,
								'relationshipUrls': {
								}
							}
						},
						'status': {
							'success': true,
							'detail': {}
						}
					});

				nock(dispatcher.url)
					.matchHeader('Accept', 'application/pdf')
					.matchHeader('Cookie', function (val) {
						return val.indexOf('authToken=') > -1;
					})
					.get(dispatcher.path + '/object/activity/2/form/download')
					.reply(200);

				activity.byID(2, (err, actv) => {
					activity.download(actv, 'test/2.pdf', (err) => {
						expect(err).to.exist;

						done();
					});
				});
			});
		}

		it('get activity count', function (done) {
			nock(dispatcher.url)
				.matchHeader('Cookie', function (val) {
					return val.indexOf('authToken=') > -1;
				})
				.get(dispatcher.path + '/object/activity/search')
				.query(function (q) {
					return q.limit === '0';
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

	describe('location', function () {
		it('get by ID', function (done) {
			nock(dispatcher.url)
				.matchHeader('Cookie', function (val) {
					return val.indexOf('authToken=') > -1;
				})
				.get(dispatcher.path + '/object/location/1')
				.reply(200, {
					'response': {
						'location': {
							'id': 1,
							'phone': '(111) 111-1111',
							'address': '54321 S. 10th St.',
							'city': 'Bakersfield',
							'state': 'California',
							'countryCode': 'US',
							'zipCode': 93313,
							'locationName': 'Test Facility 1 - Bakersfield',
							'locationCode': 'LOC-BAK1',
						}
					},
					'status': {
						'success': true,
						'detail': {}
					}
				});

			location.byID(1, (err, res) => {
				expect(err).to.not.exist;
				expect(res).to.exist;

				loc = res;

				done();
			});
		});

		it('all locations', function (done) {
			nock(dispatcher.url)
				.matchHeader('Cookie', function (val) {
					return val.indexOf('authToken=') > -1;
				})
				.get(dispatcher.path + '/object/location')
				.reply(200, {
					'response': {
						'locations': [
							{
								'location': {
									'id': 1,
									'phone': '(111) 111-1111',
									'address': '54321 S. 10th St.',
									'city': 'Bakersfield',
									'state': 'California',
									'countryCode': 'US',
									'zipCode': 93313,
									'locationName': 'Test Facility 1 - Bakersfield',
									'locationCode': 'LOC-BAK1',
								}
							},
							{
								'location': {
									'id': 2,
									'phone': '(222) 222-2222',
									'address': '98765 S. 11th St.',
									'city': 'Bakersfield',
									'state': 'California',
									'countryCode': 'US',
									'zipCode': 93313,
									'locationName': 'Test Facility 2 - Bakersfield',
									'locationCode': 'LOC-BAK2',
								}
							}
						]
					},
					'status': {
						'success': true,
						'detail': {}
					}
				});

			location.all((err, locations) => {
				expect(err).to.not.exist;
				expect(locations).to.exist;
				expect(locations.length).to.be.a('number');

				done();
			});
		});
	});

	describe('employee - packet', function () {
		var emp = null;

		before(function (done) {
			nock(dispatcher.url)
				.matchHeader('Cookie', function (val) {
					return val.indexOf('authToken=') > -1;
				})
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
					.matchHeader('Cookie', function (val) {
						return val.indexOf('authToken=') > -1;
					})
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
					.matchHeader('Cookie', function (val) {
						return val.indexOf('authToken=') > -1;
					})
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
					.matchHeader('Cookie', function (val) {
						return val.indexOf('authToken=') > -1;
					})
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

	describe('packet - activity', function () {
		var pkt = null;

		before(function (done) {
			nock(dispatcher.url)
				.matchHeader('Cookie', function (val) {
					return val.indexOf('authToken=') > -1;
				})
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

			packet.byID(10, (err, res) => {
				pkt = res;

				done();
			});
		});

		it('get packet activities', function (done) {
			nock(dispatcher.url)
				.matchHeader('Cookie', function (val) {
					return val.indexOf('authToken=') > -1;
				})
				.get(dispatcher.path + '/object/packet/10/activity')
				.reply(200, {
					'response': {
						'activities': [
							{
								'activity': {
									'id': 1000,
									'assignee': [
										1
									],
									'activityDesc': 'Activity',
									'item': 'Activity Item',
									'status': 3,
									'title': 'Activity Title',
									'relationshipUrls': {
										'formDownloadUrl': dispatcher.url + dispatcher.path + '/object/activity/1000/form/download'
									}
								}
							},
							{
								'activity': {
									'id': 1001,
									'assignee': [
										1
									],
									'activityDesc': 'Activity',
									'item': 'Activity Item',
									'status': 1,
									'title': 'Activity Title',
									'relationshipUrls': {
									}
								}
							},
							{
								'activity': {
									'id': 1002,
									'assignee': [
										1,
										2
									],
									'activityDesc': 'Activity',
									'item': 'Activity Item',
									'status': 3,
									'title': 'Activity Title',
									'relationshipUrls': {
										'formDownloadUrl': dispatcher.url + dispatcher.path + '/object/activity/1002/form/download'
									}
								}
							}
						]
					},
					'status': {
						'success': true,
						'detail': {}
					}
				});

			packet.activities(pkt, (err, activities) => {
				expect(err).to.not.exist;
				expect(activities).to.exist;
				expect(activities).to.be.an('array');
				expect(activities[0].completed()).to.equal(true);
				expect(activities[1].completed()).to.equal(false);
				expect(activities[0].signed()).to.equal(true);
				expect(activities[1].signed()).to.equal(false);
				expect(activities[2].signed()).to.equal(false);
				done();
			});
		});
	});
});
