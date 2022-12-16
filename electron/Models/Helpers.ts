import { Database, QueryExecResult } from "sql.js"
import * as path from 'path';

type AnyObject = {
    [key: string]: any
}

export const AsObject = <T extends AnyObject>(result: QueryExecResult[]) => {
    if (result.length < 1) {
        return []
    }
    const {columns, values} = result[0]
    return values.map(row => {
        const object: T = {} as T
        for (const i in columns) {
            //@ts-ignore
            object[columns[i]] = row[i]
        }
        return object
    })
}

export const assert = (bool: boolean) => {
    if (!bool) throw new Error ("Assertion failed.")
}

export const CWD = path.join(__dirname, "../../../electron")

export const LastId = (db: Database) => {
    const sql = `SELECT last_insert_rowid()`
    return db.exec(sql)[0].values[0][0] as number
}