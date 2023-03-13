import { Close, Open } from "./Core";
import { AsObject, assert, LastId } from "./Helpers";

interface Appsetting {
	id: number;
	isdaylight: number;
}

class Appsetting {
	static async GetAll() {
		const db = await Open();
		const result = db.exec("SELECT * FROM appsetting");
		Close(db, false);
		return AsObject<Appsetting>(result);
	}

	static async GetDaylight() {
		const db = await Open();
		const result = db.exec("SELECT * FROM appsetting");
		Close(db, false);
		const resObj = AsObject<Appsetting>(result);
		return resObj.length > 0 ? resObj[0].isdaylight : 0;
	}

	static async UpdateIsDaylight(isdaylight: number) {
		const db = await Open();

		// Insert or update with id=1, isdaylight=?
		const query = `INSERT or replace INTO appsetting(isdaylight, id) VALUES (${isdaylight}, 1)`;
		console.log("query: ", query);
		db.exec(query);
		const result = db.exec("SELECT * FROM appsetting");
		const resObj = AsObject<Appsetting>(result);
		Close(db, true);

		return resObj.length > 0 ? resObj[0].isdaylight : 0;
	}
}

export default Appsetting;
