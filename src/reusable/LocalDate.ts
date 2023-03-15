import { MinDigits } from "./functions";

const MONTH = {
	0: "Jan",
	1: "Feb",
	2: "Mar",
	3: "April",
	4: "May",
	5: "June",
	6: "July",
	7: "Aug",
	8: "Sep",
	9: "August",
	10: "Nov",
	11: "Dec",
};

interface LocalDateProps {
	year: number;
	month: number;
	date: number;
}

class LocalDate {
	readonly year: number;
	readonly month: number;
	readonly date: number;

	constructor(props?: LocalDateProps) {
		const dt = new Date();
		[this.year, this.month, this.date] =
			typeof props !== "undefined"
				? [props.year, props.month, props.date]
				: [dt.getFullYear(), dt.getMonth(), dt.getDate()];
	}

	UNIX() {
		const dt = new Date();
		dt.setFullYear(this.year, this.month, this.date);
		dt.setHours(0, 0, 0);
		return dt.getTime();
	}

	gte(date: LocalDate) {
		return this.UNIX() >= date.UNIX();
	}

	lte(date: LocalDate) {
		return this.UNIX() <= date.UNIX();
	}

	range(to_date: LocalDate) {
		const [start, end] = [this.toNormalDate(), to_date.toNormalDate()];
		const arr = [];
		for (const dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
			arr.push(LocalDate.fromNormalDate(dt));
		}
		return arr;
	}

	static fromSerialized(serialized_date: string) {
		const [year, month, date] = serialized_date.split("-");
		return new LocalDate({
			year: parseInt(year),
			month: parseInt(month) - 1,
			date: parseInt(date),
		});
	}

	toSerialized() {
		const [year, month, date] = [
			MinDigits(4, this.year),
			MinDigits(2, this.month + 1),
			MinDigits(2, this.date),
		];

		return `${year}-${month}-${date}`;
	}

	static fromNormalDate(dt: Date) {
		return new LocalDate({
			year: dt.getFullYear(),
			month: dt.getMonth(),
			date: dt.getDate(),
		});
	}

	toNormalDate() {
		const dt = new Date();
		dt.setFullYear(this.year, this.month, this.date);
		dt.setHours(0, 0, 0);
		return dt;
	}

	getMonthName() {
		return (MONTH as any)[this.month];
	}
}

export default LocalDate;
