import { Close, Open } from "./Core"
import { AsObject, assert, LastId } from "./Helpers"

interface Controller {
    id: number
    first_name: string
    last_name: string
    initials: string
}

class Controller {
    static async GetAll() {
        const db = await Open()
        const result = db.exec(
            `SELECT
                controllers.*,
                crew.id AS crew_id,
                crew.name AS crew_name
            FROM controllers
            LEFT JOIN crew_controllers ON controllers.id = crew_controllers.controller_id
            LEFT JOIN crew ON crew.id = crew_controllers.crew_id
            ORDER BY initials ASC
            `
        )
        
        Close(db, false)

        return AsObject<Controller & {
            crew_id: string | null,
            crew_name: string | null
        }>(result)
    }

    static async Insert(controller: Controller) {
        assert(controller.id === 0)
        const db = await Open()
        db.run(
            `INSERT INTO controllers (first_name, last_name, initials)
            VALUES ($first_name, $last_name, $initials)`, {
                $first_name: controller.first_name,
                $last_name: controller.last_name,
                $initials: controller.initials,    
            }
        )
        const id = LastId(db)
        Close(db, true)

        return id
    }

    static async Update(controller: Controller) {
        assert(controller.id !== 0)
        const db = await Open()
        db.run(`
            UPDATE controllers SET
            first_name = $first_name,
            last_name = $last_name,
            initials = $initials
            WHERE id = $id
        `, {
            $first_name: controller.first_name,
            $last_name: controller.last_name,
            $initials: controller.initials,
            $id: controller.id
        })
        Close(db, true)
    }

    static async Delete(controller_id: number) {
        assert(controller_id !== 0)
        const db = await Open()
        db.run(
            `
            DELETE FROM controllers WHERE id = $id
            `, {
                $id: controller_id
            }
        )
        Close(db, true)
    }

    static async UpdateCrew(controller_id: number, crew_id: number) {
        assert(controller_id !== 0)

        const db = await Open()
        
        if (crew_id === 0) {
            db.run(`
                DELETE FROM crew_controllers WHERE
                    controller_id = $controller_id
            `, {
                $controller_id: controller_id
            })
        } else {
            db.run(`
                INSERT OR REPLACE INTO crew_controllers (controller_id, crew_id)
                VALUES ($controller_id, $crew_id)
            `, {
                $crew_id: crew_id,
                $controller_id: controller_id,
            })
        }
        
        Close(db, true)
    }
}

export default Controller