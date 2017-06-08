function diagnose(err, data) {
	if (err) {
		return err.message;
	}

	if (data.status.success === false) {
		return `${data.status.detail.errorcode} ${data.status.detail.errormessage}`;
	} else {
		return null;
	}
}

module.exports = diagnose;
