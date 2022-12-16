import { Database } from "sql.js";
export declare const SQLITE_PATH: string;
export declare const Open: () => Promise<Database>;
export declare const Close: (db: Database, commit?: boolean) => void;
