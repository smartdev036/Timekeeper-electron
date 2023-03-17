import { Close, Open } from "./Models/Core";
import { AsObject } from "./Models/Helpers";

const DBUpdate = async () => {
	const db = await Open();
	try {
		db.exec("SELECT * FROM combined_center");
		console.log("'combined_center' already exists");
	} catch (error) {
		db.run(`
        CREATE TABLE combined_center (
            id INTEGER NOT NULL,
            position_id INTEGER CHECK ( position_id > 0 ) NOT NULL,
            log_date TEXT NOT NULL,
            PRIMARY KEY (id, log_date),
            UNIQUE (position_id)
        );
        `);
		console.log("'combined_center' created");
	}
	try {
		db.exec("SELECT  time_since_lastin FROM bullpen");
		console.log("'time_since_lastin' already exists");
	} catch (error) {
		db.run(`
            ALTER TABLE bullpen ADD time_since_lastin TEXT DEFAULT '0';
        `);
		console.log("'combined_center' created");
	}

	try {
		db.exec(`CREATE TABLE IF NOT EXISTS tbl_pos_combined_integration  (
            id int(0) NOT NULL,
            center_id int(0) NULL,
            combined_id int(0) NULL,
            log_date date NULL,
            PRIMARY KEY (id, center_id, combined_id, log_date)
          )`);
	} catch (err) {
		console.log("new tbl_pos_combined_integration creation error");
	}

	// DB structure update with start_time to start_minute
	try {
		const result = db.exec(
			"SELECT COUNT(*) as value FROM pragma_table_info('log_times') WHERE name = 'start_minute';"
		);
		const resObj = AsObject<any>(result);
		const isExistMinute = resObj[0].value;
		// console.log("isExistMinute: ", isExistMinute);

		if (!isExistMinute) {
			db.exec(`
				CREATE TABLE if not exists new_log_times (
					position_id INTEGER CHECK( position_id > 0 ) NOT NULL,
					controller_id INTEGER NOT NULL,
					trainee_controller_id INTEGER NOT NULL,
					log_date TEXT NOT NULL,
					start_time INTEGER NOT NULL,
					start_minute INTEGER NOT NULL,
					PRIMARY KEY (position_id, log_date, start_time)
				);
			
				INSERT INTO new_log_times (position_id, controller_id, trainee_controller_id, log_date, start_time, start_minute)
				SELECT position_id, controller_id, trainee_controller_id, log_date, start_time, Floor(start_time/60)*60 FROM log_times;
				
				drop table log_times;
				ALTER table new_log_times RENAME TO log_times;
			`);
		}
	} catch (err) {
		console.log("new tbl_pos_combined_integration creation error");
	}

	Close(db, true);
};

export default DBUpdate;
