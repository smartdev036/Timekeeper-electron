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

    try {
        db.exec(`CREATE TABLE IF NOT EXISTS tbl_pos_combined_integration  (
            id int(0) NOT NULL,
            center_id int(0) NULL,
            combined_id int(0) NULL,
            log_date date NULL,
            PRIMARY KEY (id, center_id, combined_id, log_date)
          )`)
    } catch (err) {
        console.log('new tbl_pos_combined_integration creation error')
    }
    Close(db, true)

}

export default DBUpdate