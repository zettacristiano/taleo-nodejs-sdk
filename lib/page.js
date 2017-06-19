const object = require('./object');
const generate = require('./generate');
const Employee = require('./object/employee');

function read(page, callback) {
	object[page.entity].search(page.start, page.limit, page.searchID, page.digicode, (err, body) => {
		callback(err, body && generate.entities(page.entity, body.response.searchResults))
	});
}

module.exports = {
	read: read
};
