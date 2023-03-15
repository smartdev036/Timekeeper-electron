import { MinDigits } from "./functions";
import LocalDate from "./LocalDate";
import UTCTime from "./UTCTime";

interface LocalTimeProps {
	hour: number;
	minute: number;
	second: number;
}

class LocalTime {
	readonly hour: number;
	readonly minute: number;
	readonly second: number;

	constructor(props?: LocalTimeProps) {
		const dt = new Date();
		[this.hour, this.minute, this.second] =
			typeof props !== "undefined"
				? [props.hour, props.minute, props.second]
				: [dt.getHours(), dt.getMinutes(), dt.getSeconds()];
	}

	static fromSerialized(serialized_time: number) {
		const [TotalMinutes, seconds] = [
			Math.floor(serialized_time / 60),
			Math.floor(serialized_time % 60),
		];
		const [hours, minutes] = [
			Math.floor(TotalMinutes / 60),
			Math.floor(TotalMinutes % 60),
		];

		return new LocalTime({
			hour: hours,
			minute: minutes,
			second: seconds,
		});
	}

	toSerialized() {
		const TotalSeconds = this.hour * 60 * 60 + this.minute * 60 + this.second;

		return TotalSeconds;
	}

	formatToString() {
		return `${MinDigits(2, this.hour)}:${MinDigits(
			2,
			this.minute
		)} ${LocalTime.getTimeZone()}`;
	}

	static convertFromUTC(utcTime: UTCTime) {
		const d = new Date();
		d.setUTCFullYear(2000, 1, 1);
		d.setUTCHours(utcTime.hour, utcTime.minute, utcTime.second);

		return new LocalTime({
			hour: d.getHours(),
			minute: d.getMinutes(),
			second: d.getSeconds(),
		});
	}

	convertToUTC() {
		const d = new Date();
		d.setFullYear(2000, 1, 1);
		d.setHours(this.hour, this.minute, this.second);
		return new UTCTime({
			hour: d.getUTCHours(),
			minute: d.getUTCMinutes(),
			second: d.getUTCSeconds(),
		});
	}

	static getTimeZone() {
		// const offset = (new Date().getTimezoneOffset() / 60) * -1 + 1;
		// return `GMT ${offset > 0 ? "+" : ""} ${offset}`;
		return new Date()
			.toLocaleTimeString("en-us", { timeZoneName: "short" })
			.split(" ")[2];
	}

	mergeDate(date: LocalDate) {
		const d = new Date();
		d.setFullYear(date.year, date.month, date.date);
		d.setHours(this.hour, this.minute, this.second);

		return d;
	}
}

export default LocalTime;
