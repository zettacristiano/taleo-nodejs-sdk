function diagnose(data) {
	if (data.status.success === false) {
		return `${data.status.detail.errorcode} ${data.status.detail.errormessage}`;
	} else {
		return null;
	}
}

module.exports = diagnose;
