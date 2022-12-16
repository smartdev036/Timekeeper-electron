import { Close, Open } from "./Models/Core"

const DBUpdate = async () => {
    const db = await Open()
    try {
        db.exec("SELECT * FROM combined_center")
        console.log("'combined_center' already exists")
    } catch (error) {
        db.run(`
        CREATE TABLE combined_center (
            id INTEGER NOT NULL,
            position_id INTEGER CHECK ( position_id > 0 ) NOT NULL,
            log_date TEXT NOT NULL,
            PRIMARY KEY (id, log_date),
            UNIQUE (position_id)
        );
        `)
        console.log("'combined_center' created")
    }
    try {
        db.exec("SELECT  time_since_lastin FROM bullpen")
        console.log("'time_since_lastin' already exists")
    } catch (error) {
        db.run(`
            ALTER TABLE bullpen ADD time_since_lastin TEXT DEFAULT '0';
        `)
        console.log("'combined_center' created")
    }
    Close(db, true)

}

export default DBUpdate