export const clone = <T extends any>(o: T): T => JSON.parse(JSON.stringify(o));

export const isNumeric = (s: string) => !isNaN(parseInt(s));

export const MinDigits = (digits: number, num: number) => {
	const str = num.toString();
	const zeros = Math.max(0, digits - str.length);
	const zero_str = new Array(zeros)
		.fill(null)
		.map(() => "0")
		.join("");
	return zero_str + str;
};

export const fromSerializedTime = (
	TotalSeconds: number,
	toNormalTime: boolean = false
) => {
	const [TotalMinutes, seconds] = [
		Math.floor(TotalSeconds / 60),
		Math.floor(TotalSeconds % 60),
	];
	const [hours, minutes] = [
		Math.floor(TotalMinutes / 60),
		Math.floor(TotalMinutes % 60),
	];

	const d = new Date();
	if (toNormalTime) {
		// d.setFullYear(2000, 0, 1);
		d.setHours(hours, minutes, seconds);
	} else {
		// d.setUTCFullYear(2000, 0, 1);
		d.setUTCHours(hours, minutes, seconds);
	}

	return d;
};

export const isEmpty = (...values: string[]) =>
	values.some((val) => val.trim() === "");
