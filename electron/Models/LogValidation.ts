import LocalDate from "../../src/reusable/LocalDate"
import { Close, Open } from "./Core"
import { AsObject, assert } from "./Helpers"

interface LogValidation {
    position_id: number
    log_date: string
    timestamp: number
}

class LogValidation {
    static async Add(position_id: number, log_date: string) {
        assert(position_id !== 0)
       
        const db = await Open()

        // Validating abs(start_minute-start_time) < 60
        db.run(
            `
            UPDATE log_times 
                SET start_minute = Floor(start_time/60)*60 
            where 
                log_date=$log_date and position_id=$position_id;
            `, {
                $position_id: position_id,
                $log_date: log_date,
            }
        )
        // After validation abs(start_minute-start_time) < 60
        db.run(
            `INSERT INTO log_validation
                (position_id, log_date, timestamp)
            VALUES
                ($position_id, $log_date, $timestamp)
            `, {
                $position_id: position_id,
                $log_date: log_date,
                $timestamp: Math.floor(Date.now()/1000),
            }
        )
        Close(db, true)
    }

    static async Delete(position_id: number, log_date: string) {
        assert(position_id !== 0)
       
        const db = await Open()

        // After validation abs(start_minute-start_time) < 60
        db.run(
            `DELETE FROM log_validation
            WHERE
                position_id = $position_id and log_date = $log_date
            `, {
                $position_id: position_id,
                $log_date: log_date,
            }
        )
        Close(db, true)
    }

    static async GetAllValidations(log_date: string) {
        const db = await Open()

        const result = db.exec(
            `
            SELECT * FROM log_validation
            WHERE log_date = $log_date
            `, {
                $log_date: log_date
            }
        )

        Close(db, false)

        return AsObject<LogValidation>(result)
    }

    static async UnValidated(log_date: string) {
        const db = await Open()

        const result = db.exec(
            `
            SELECT positions.* FROM positions
            LEFT JOIN log_validation ON
                log_validation.position_id = positions.id AND
                log_date = $log_date
            WHERE log_validation.position_id IS NULL
            AND $log_date >= positions.created_date
            `, {
                $log_date: log_date
            }
        )

        Close(db, false)

        return AsObject<any>(result).length
    }

    static async ValidationCalendar(from_log_date: string, to_log_date: string) {
        const db = await Open()

        const stmnt = db.prepare(
            `
            SELECT $log_date AS log_date, COUNT(*) AS count FROM positions
            LEFT JOIN log_validation ON
                log_validation.position_id = positions.id AND
                log_date = $log_date
            WHERE log_validation.position_id IS NULL
            AND $log_date >= positions.created_date
            ;
            `
        )

        const Calendar: {
            [date: string]: number
        } = {}

        for (const day of LocalDate.fromSerialized(from_log_date).range(LocalDate.fromSerialized(to_log_date))) {
            const log_date = day.toSerialized()
            const result = stmnt.getAsObject({
                $log_date: log_date,
            })
            Calendar[result.log_date as string] = result.count as number
        }
         
        stmnt.free()

        Close(db, false)

        return Calendar
    }
}

export default LogValidation