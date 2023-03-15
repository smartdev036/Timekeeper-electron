class DaylightDate {
	readonly dDate: Date;
	constructor(isdaylight: boolean) {
		let df = new Date();
		if (isdaylight) {
			const mSeconds = df.getMilliseconds();
			df = new Date(mSeconds + 60 * 60 * 1000);
		}
		this.dDate = df;
	}
}

export default DaylightDate;
