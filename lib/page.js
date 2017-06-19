const object = require('./object');
const Employee = require('./object/employee');

function generateEntities(entity, results) {
	var list = []
	var item = null;

	for (var i = 0; i < results.length; ++i) {
		if (entity === 'employee') {
			item = new Employee(results[i].employee);
		}

		list.push(item);
	}

	return list;
}

function read(page, callback) {
	object[page.entity].search(page.start, page.limit, page.searchID, page.digicode, (err, body) => {
		callback(err, body && generateEntities(page.entity, body.response.searchResults))
	});
}

module.exports = {
	read: read
};
