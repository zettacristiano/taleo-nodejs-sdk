const object = require('./object');
const Employee = require('./object/employee');

function each(page, callback) {
	object[page.entity].search(page.start, page.limit, page.searchID, page.digicode, (err, body) => {
		if (err)
			callback(err);

		var list = body.response.searchResults;

		list.forEach((item, idx, array) => {
			callback(null, new Employee(item.employee));
		});
	});
}

module.exports = {
	each: each
};
