const object = require('./object');
const Packet = require('./object/packet');

function byID(id, callback) {
	object.packet.id(id, (err, body) => {
		callback(err, body && new Packet(body));
	});
}

module.exports = {
	byID: byID
}
