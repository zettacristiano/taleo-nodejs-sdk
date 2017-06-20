function diagnose(err, data) {
	if (err) {
		return err;
	}

	if (data && data.status.success === false) {
		return new Error(`${data.status.detail.errorcode} ${data.status.detail.errormessage}`);
	} else {
		return null;
	}
}

module.exports = diagnose;
