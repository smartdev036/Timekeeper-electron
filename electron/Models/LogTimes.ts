import { Database } from "sql.js";
import { PositionCombinations, Positions } from ".";
import { Close, Open } from "./Core";
import { AsObject, assert } from "./Helpers";
import * as fs from "fs";
import LocalTime from "../../src/reusable/LocalTime";
import { app } from "electron";
import * as path from "path";
import * as dayjs from "dayjs";
import { convertSecondToMinute } from "../helpers/convertSecondToMinute";

export const LOG_HISTORY_HISTORY = path.join(
	app.getPath("userData"),
	"logHistory"
);

interface LogTimes {
	position_id: number;
	controller_id: number;
	trainee_controller_id: number;
	log_date: string;
	start_time: number;
}

export type ReportTypes = "protime" | "trainer";

class LogTimes {
	private static async RemoveCombinationsIfEmpty(
		db: Database,
		$log_date: string
	) {
		db.run(
			`
        DELETE FROM positions_combined
        WHERE log_date = $log_date
        AND position_id IN (
            SELECT positions_combined.position_id FROM positions_combined
            LEFT JOIN log_times ON
                log_times.position_id = positions_combined.position_id AND
                log_times.log_date = positions_combined.log_date
            WHERE positions_combined.log_date = $log_date
            AND log_times.position_id IS NULL
        );
        `,
			{
				$log_date,
			}
		);
	}

	static async Add(log_time: LogTimes, isClosing: boolean = false) {
		assert(log_time.position_id !== 0);
		if (!isClosing) {
			assert(log_time.controller_id !== 0);
		}

		const db = await Open();

		const positions_associated = AsObject<PositionCombinations>(
			db.exec(
				`
        SELECT * FROM positions_combined
        WHERE id = (
            SELECT id FROM positions_combined
            WHERE position_id = $position_id
            AND log_date = $log_date
        )
        AND log_date = $log_date
        ;`,
				{
					$position_id: log_time.position_id,
					$log_date: log_time.log_date,
				}
			)
		);

		const stmnt = db.prepare(
			`INSERT INTO log_times
                (position_id, controller_id, trainee_controller_id, log_date, start_time, start_minute)
            VALUES
                ($position_id, $controller_id, $trainee_controller_id, $log_date, $start_time, $start_minute)
            `
		);

		if (positions_associated.length === 0) {
			stmnt.run({
				$position_id: log_time.position_id,
				$controller_id: log_time.controller_id,
				$trainee_controller_id: log_time.trainee_controller_id,
				$log_date: log_time.log_date,
				$start_time: log_time.start_time,
				$start_minute: convertSecondToMinute(log_time.start_time),
			});
		}

		for (const { position_id } of positions_associated) {
			stmnt.run({
				$position_id: position_id,
				$controller_id: log_time.controller_id,
				$trainee_controller_id: log_time.trainee_controller_id,
				$log_date: log_time.log_date,
				$start_time: log_time.start_time,
				$start_minute: convertSecondToMinute(log_time.start_time),
			});
		}
		stmnt.free();

		Close(db, true);
	}

	static async Update(
		prev_log_time: LogTimes,
		log_time: LogTimes,
		canDelete: boolean = false
	) {
		assert(log_time.position_id !== 0);
		if (!canDelete) {
			assert(log_time.controller_id !== 0);
		}

		const db = await Open();

		const rows = db.run(
			`UPDATE log_times SET
                controller_id = $controller_id,
                trainee_controller_id = $trainee_controller_id,
                start_time = $start_time,
                start_minute = $start_minute
            WHERE position_id = $prev_position_id
            AND log_date = $prev_log_date
            AND start_time = $prev_start_time
            `,
			{
				$controller_id: log_time.controller_id,
				$trainee_controller_id: log_time.trainee_controller_id,
				$start_time: log_time.start_time,
				$start_minute: convertSecondToMinute(log_time.start_time),
				$prev_position_id: prev_log_time.position_id,
				$prev_log_date: prev_log_time.log_date,
				$prev_start_time: prev_log_time.start_time,
			}
		);

		Close(db, true);
	}

	static async Delete(
		position_id: number,
		log_date: string,
		start_time: number
	) {
		const db = await Open();

		db.run(
			`
        DELETE FROM log_times
        WHERE position_id = $position_id
        AND log_date = $log_date
        AND start_time = $start_time
        `,
			{
				$position_id: position_id,
				$log_date: log_date,
				$start_time: start_time,
			}
		);

		LogTimes.RemoveCombinationsIfEmpty(db, log_date);
		PositionCombinations.__public_CleanupCombine(db, log_date);

		Close(db, true);
	}

	static async Close(log_time: {
		position_id: number;
		log_date: string;
		start_time: number;
	}) {
		return await LogTimes.Add(
			{
				position_id: log_time.position_id,
				controller_id: 0,
				trainee_controller_id: 0,
				log_date: log_time.log_date,
				start_time: log_time.start_time,
			},
			true
		);
	}

	static async GetAllPositionsStatus(log_date: string, until_time?: number) {
		const db = await Open();

		const result = db.exec(
			`
            SELECT
                position_status.*,
                controllers.initials AS controller_initials,
                trainee.initials AS trainee_initials
            FROM (
                SELECT * from log_times
                WHERE log_date = $log_date
                ${
									typeof until_time === "undefined"
										? ""
										: `AND start_time <= ${until_time}`
								}
                ORDER BY position_id ASC, start_time DESC
            ) AS position_status
            LEFT JOIN controllers ON controllers.id = position_status.controller_id
            LEFT JOIN controllers AS trainee ON trainee.id = position_status.trainee_controller_id
            GROUP BY position_id
            `,
			{
				$log_date: log_date,
			}
		);
		return AsObject<
			LogTimes & {
				controller_initials: string;
				trainee_initials: string;
			}
		>(result);
	}
	static async GetAllPositionsStatusValues(
		log_date: string,
		until_time?: number
	) {
		// console.log('log_date:', log_date, " until_time:", until_time)
		const db = await Open();

		const result = db.exec(
			`
            SELECT
                position_status.*,
                controllers.initials AS controller_initials,
                trainee.initials AS trainee_initials
            FROM (
                SELECT * from log_times
                WHERE log_date = $log_date
                ${
									typeof until_time === "undefined"
										? ""
										: `AND position_id = ${until_time}`
								}
                ORDER BY start_time DESC
            ) AS position_status
            LEFT JOIN controllers ON controllers.id = position_status.controller_id
            LEFT JOIN controllers AS trainee ON trainee.id = position_status.trainee_controller_id
            `,
			{
				$log_date: log_date,
			}
		);
		return AsObject<
			LogTimes & {
				controller_initials: string;
				trainee_initials: string;
			}
		>(result);
	}

	static async GetAllLogs(position_id: number, log_date: string) {
		const db = await Open();

		const result = db.exec(
			`
            SELECT
                log_times.*,
                controllers.initials AS controller_initials,
                trainee.initials AS trainee_initials
            FROM log_times
            LEFT JOIN controllers ON controllers.id = log_times.controller_id
            LEFT JOIN controllers AS trainee ON trainee.id = log_times.trainee_controller_id
            WHERE position_id = $position_id
            AND log_date = $log_date
            ORDER BY start_time ASC
            `,
			{
				$position_id: position_id,
				$log_date: log_date,
			}
		);

		Close(db, false);

		return AsObject<
			LogTimes & {
				controller_initials: string;
				trainee_initials: string;
			}
		>(result);
	}

	static async GetReport(
		type: ReportTypes,
		start_date: string,
		end_date: string
	) {
		const db = await Open();

		const protime_select_controller_id = `
                CASE WHEN log_times.trainee_controller_id = 0
                    THEN log_times.controller_id
                    ELSE log_times.trainee_controller_id
                END AS controller_id
        `;

		const sql = `
        SELECT
            controller_id,
            position_id,
            SUM(duration) AS duration
        FROM (
            SELECT
                ${
									type === "protime"
										? protime_select_controller_id
										: "log_times.controller_id"
								},
                log_times.position_id,
                MIN(n.start_minute) - log_times.start_minute AS duration
            FROM log_times
            LEFT JOIN log_times AS n ON
                n.position_id = log_times.position_id AND
                n.log_date = log_times.log_date AND
                n.start_time > log_times.start_time
            WHERE log_times.log_date BETWEEN $start_date AND $end_date
            ${
							type === "protime"
								? ""
								: "AND log_times.trainee_controller_id != 0"
						}
            GROUP BY log_times.position_id, log_times.log_date, log_times.start_time
            ORDER BY log_times.start_time ASC
        ) AS duration
        GROUP BY controller_id, position_id
        `;

		const result = db.exec(sql, {
			$start_date: start_date,
			$end_date: end_date,
		});

		Close(db, false);

		const reports = AsObject<{
			controller_id: number;
			position_id: number;
			duration: number;
		}>(result);

		return reports;
	}

	static async SaveDailyLog(
		data: { position: Positions; logtimes: any }[],
		log_date: string
	) {
		let resObj = {
			success: false,
			msg: "",
		};

		try {
			if (!fs.existsSync(LOG_HISTORY_HISTORY)) {
				fs.mkdirSync(LOG_HISTORY_HISTORY);
			}

			if (fs.existsSync(LOG_HISTORY_HISTORY)) {
				let nDate: Date = new Date();
				const dateStr: string =
					"" +
					nDate.getFullYear() +
					"-" +
					(nDate.getMonth() + 1) +
					"-" +
					nDate.getDate();
				resObj.msg = dateStr;
				const filename = path.join(LOG_HISTORY_HISTORY, dateStr + ".csv");
				//  Build csv string...
				const nextLine = "\r\n";
				let writeString = "";

				writeString += "FACILITY," + ", " + nextLine;
				writeString +=
					"DATE," +
					dayjs(new Date(dateStr)).format("DDMMMYYYY") +
					", " +
					nextLine +
					nextLine;

				writeString += "POSTION, ON, CONTROLLER, TRAINEE" + nextLine;

				data.forEach((item) => {
					let position_name = item.position.name;
					let logtimes = item.logtimes.result;
					if (logtimes.length > 0) {
						logtimes.forEach(
							(
								log: LogTimes & {
									controller_initials: string;
									trainee_initials: string;
								}
							) => {
								let log_time = LocalTime.fromSerialized(log.start_time)
									.convertToUTC()
									.formatToWithoutZ();
								if (log.controller_id) {
									writeString += `${position_name}, ${log_time}, ${
										log.controller_initials
									}, ${log.trainee_initials ?? "---"}, ${nextLine}`;
								} else {
									writeString += `${position_name}, ${log_time}, ${"---"}, ${"---"}, ${nextLine}`;
								}
								position_name = "";
							}
						);
					} else {
						writeString += `${position_name},  ${nextLine}`;
					}
				});

				writeString += nextLine + "Saved at, " + new Date().toString();

				fs.writeFileSync(filename, writeString);
				resObj.success = true;
				return resObj;
			}
		} catch (err) {
			console.log("err-catch: ", err);
		}
		return resObj;
	}
}

export default LogTimes;
