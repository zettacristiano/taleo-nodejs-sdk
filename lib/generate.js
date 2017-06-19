/* Generate entities from a list of objects returned by Taleo.
 */
const Employee = require('./object/employee');

function employees(results) {
	var list = []

	for (var i = 0; i < results.length; ++i) {
		list.push(new Employee(results[i].employee));
	}

	return list;
}

function entities(entity, results) {
	if (entity === 'employee') {
		return employees(results);
	} else {
		return null;
	}
}

module.exports = {
	entities: entities
}
