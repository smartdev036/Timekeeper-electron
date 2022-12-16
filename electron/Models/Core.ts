import * as path from 'path';
import * as fs from "fs"
import { app } from "electron"
import initSqlJs, { Database } from "sql.js"
import schema from './schema';

console.log("Loading Database...")

export const SQLITE_PATH = path.join(app.getPath("userData"), "timekeeper-lj-sqlite.db")
console.log(`DATABASE located at "${SQLITE_PATH}"`)

setTimeout(() => console.log(`DATABASE located at "${SQLITE_PATH}"`), 10 * 1000)

let sharedCache: Buffer | undefined

export const Open = async () => {
    console.log(`DATABASE located at "${SQLITE_PATH}"`)

    const SQL = await initSqlJs()
    try {
        if (typeof sharedCache !== "undefined") {
            return new SQL.Database(sharedCache)
        }
        const filebuffer = fs.readFileSync(SQLITE_PATH);
        return new SQL.Database(filebuffer)
    } catch (error) {
        const db = new SQL.Database()
        db.run(schema)
        return db
    }
}

const Commit = (db: Database) => {
    sharedCache = Buffer.from(db.export())
    fs.writeFileSync(SQLITE_PATH, sharedCache);
}

export const Close = (db: Database, commit: boolean = false) => {
    if (commit) {
        Commit(db)
    }
    db.close()
}