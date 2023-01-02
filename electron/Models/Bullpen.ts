import { Controller, LogTimes } from "."
import LocalDate from "../../src/reusable/LocalDate"
import { Close, Open } from "./Core"
import { AsObject, assert } from "./Helpers"

type BullpenTypes = "controller"

interface Bullpen {
    type: BullpenTypes
    id: number
    time_since_lastin: string
}

class Bullpen {
    static async Add(id: number) {
        assert(id !== 0)
        let today = new LocalDate().toSerialized()
        const db = await Open()
        db.run(`
            INSERT INTO bullpen (type, id, time_since_lastin)
            VALUES ($type, $id, $time_since_lastin)
        `, {
            $type: "controller",
            $id: id,
            $time_since_lastin: (new Date()).getTime()
        })
        Close(db, true)
    }

    static async AddWithActiveTime(id: number, time_since_lastin: string) {
        assert(id !== 0)
        const db = await Open()
        db.run(`
            INSERT INTO bullpen (type, id, time_since_lastin)
            VALUES ($type, $id, $time_since_lastin)
        `, {
            $type: "controller",
            $id: id,
            $time_since_lastin: time_since_lastin
        })
        Close(db, true)
    }

    static async AddWithActiveTest(id: number) {
        assert(id !== 0)
        let today = new LocalDate().toSerialized()
        const db = await Open()
        const result = db.exec(
            `
            select max(start_time) as max_time, controller_id, "trainee_controller_id"
            from log_times 
            where log_date='2022-12-29'
            group By (position_id)
            `
        )

        let flag_as_controller = AsObject<{
            max_time: number ,
            controller_id: number, 
            trainee_controller_id: number, 
        }>(await result).filter(row => row?.controller_id === id ).length

        let flag_as_trainee_controller = AsObject<{
            max_time: number ,
            controller_id: number, 
            trainee_controller_id: number, 
        }>(await result).filter(row => row?.trainee_controller_id === id ).length
        if( flag_as_controller === 0 && flag_as_trainee_controller === 0 ){
            db.run(`
                INSERT INTO bullpen (type, id, time_since_lastin)
                VALUES ($type, $id, $time_since_lastin)
            `, {
                $type: "controller",
                $id: id,
                $time_since_lastin: (new Date()).getTime()
            })
        }
        Close(db, true)
    }

    static async UpdateTimeSinceInActive(controllerId: number, time_since_lastin: string) {
        const db = await Open()
        db.run(`
            UPDATE bullpen
            SET time_since_lastin = $time_since_lastin
            WHERE id = $controllerId
        `, {
            $controllerId: controllerId,
            $time_since_lastin: time_since_lastin
        })
        Close(db, true)
    }


    static async AddCrew(id: number) {
        assert(id !== 0)
        const controllers = (
            (await Controller.GetAll())
            .filter(controller => parseInt(controller.crew_id ?? "0") === id)
        )
        const db = await Open()

        // Check if exist 
        const status = await LogTimes.GetAllPositionsStatus(new LocalDate().toSerialized(),undefined)
        
        const busy_controller_ids = (status ?? []).map(row => [row.controller_id, row.trainee_controller_id]).flat()

        const stmnt = db.prepare(
            `INSERT OR IGNORE INTO bullpen (type, id, time_since_lastin)
            VALUES ($type, $id, $time_since_lastin)`
        )
        for (const controller of controllers) {
            if( busy_controller_ids.filter(id => id === controller.id ).length === 0){
                stmnt.run({
                    $type: "controller",
                    $id: controller.id,
                    $time_since_lastin: (new Date()).getTime()
                })
            }
        }
        stmnt.free()

        Close(db, true)
    }

    static async Delete(id: number) {
        assert(id !== 0)
        const db = await Open()
        db.run(`
            DELETE FROM bullpen WHERE type = $type AND id = $id
        `, {
            $type: "controller",
            $id: id    
        })
        Close(db, true)
    }

    static async GetAll(filterBusyDate: string | null, until_time?: number) {
        const db = await Open()
        
        const result = db.exec(
            `SELECT
                bullpen.*,
                controllers.first_name,
                controllers.last_name,
                controllers.initials
            FROM bullpen
            JOIN controllers ON controllers.id = bullpen.id`
        )
        let objects = AsObject<Bullpen & Controller>(result)
        if (filterBusyDate !== null) {
            const status = await LogTimes.GetAllPositionsStatus(filterBusyDate, until_time)
            const busy_controllers = status.map(row => [row.controller_id, row.trainee_controller_id]).flat()
            objects = objects.filter(row => !busy_controllers.includes(row.id))
        }

        Close(db, false)

        return objects
    }
}

export default Bullpen