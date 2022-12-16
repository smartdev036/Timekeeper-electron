import { Database, QueryExecResult } from "sql.js";
declare type AnyObject = {
    [key: string]: any;
};
export declare const AsObject: <T extends AnyObject>(result: QueryExecResult[]) => T[];
export declare const assert: (bool: boolean) => void;
export declare const CWD: string;
export declare const LastId: (db: Database) => number;
export {};
