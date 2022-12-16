import { Close, Open } from "./Core"
import { AsObject, assert, LastId } from "./Helpers"

interface Crew {
    id: number
    name: string
}

class Crew {
    static async GetAll() {
        const db = await Open()
        const result = db.exec("SELECT * FROM crew")
                
        Close(db, false)

        return AsObject<Crew>(result)
    }

    static async Insert(crew: Crew) {
        assert(crew.id === 0)
        const db = await Open()
        db.run(
            `INSERT INTO crew (name)
            VALUES ($name)`, {
                $name: crew.name,
            }
        )
        const id = LastId(db)
        
        Close(db, true)

        return id
    }

    static async Update(crew: Crew) {
        assert(crew.id !== 0)
        const db = await Open()
        db.run(`
            UPDATE crew SET
                name = $name
            WHERE id = $id
        `, {
            $name: crew.name,
            $id: crew.id
        })
        Close(db, true)
    }
}

export default Crew