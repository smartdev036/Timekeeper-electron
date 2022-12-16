import LocalDate from "../../src/reusable/LocalDate"
import { Close, Open } from "./Core"
import { AsObject, assert, LastId } from "./Helpers"

interface Positions {
    id: number
    name: string
    shorthand: string
    position: number | null
    relief_exempt: number
    relief_time_min: number
    proficiency_time_min: number
    created_date: string
}

class Positions {
    static async GetAll(until_date?: string) {
        const db = await Open()
        const result = db.exec(
            `SELECT * FROM positions
            ${until_date && `WHERE created_date <= $until_date`}
            ORDER BY shorthand ASC
            `, {
                $until_date: until_date ?? new LocalDate().toSerialized()
            }
        )

        Close(db, false)

        return AsObject<Positions>(result)
    }

    static async Insert(position: Positions) {
        assert(position.id === 0)
        const db = await Open()
        db.run(
            `INSERT INTO positions (name, shorthand, position, relief_exempt, relief_time_min, proficiency_time_min, created_date)
            VALUES ($name, $shorthand, $position, $relief_exempt, $relief_time_min, $proficiency_time_min, $created_date)`, {
                $name: position.name,
                $shorthand: position.shorthand,
                $position: position.position,
                $relief_exempt: position.relief_exempt,
                $relief_time_min: position.relief_time_min,
                $proficiency_time_min: position.proficiency_time_min,
                $created_date: position.created_date
            }
        )
        const id = LastId(db)
        Close(db, true)

        return id
    }

    static async Update(position: Positions) {
        assert(position.id !== 0)
        
        const db = await Open()
        db.run(`
            UPDATE positions SET
                name = $name,
                shorthand = $shorthand,
                position = $position,
                relief_exempt = $relief_exempt,
                relief_time_min = $relief_time_min,
                proficiency_time_min = $proficiency_time_min,
                created_date = $created_date
            WHERE id = $id
        `, {
            $name: position.name,
            $shorthand: position.shorthand,
            $position: position.position,
            $relief_exempt: position.relief_exempt,
            $relief_time_min: position.relief_time_min,
            $proficiency_time_min: position.proficiency_time_min,
            $created_date: position.created_date,
            $id: position.id
        })
        Close(db, true)
    }

    static async UpdateIndex(id: number, position: number | null) {
        assert(id !== 0)

        const db = await Open()
        db.run(`
            UPDATE positions SET
                position = $position
            WHERE id = $id
        `, {
            $position: position,
            $id: id,
        })
        Close(db, true)
        
    }

    static async Delete(id: number) {
        assert(id !== 0)

        const db = await Open()
        db.run(
            `DELETE FROM positions WHERE id = $id`, {
                $id: id,
            }
        )
        Close(db, true)
    }
}

export default Positions