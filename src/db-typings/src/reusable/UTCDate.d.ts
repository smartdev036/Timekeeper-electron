interface UTCDateProps {
    year: number;
    month: number;
    date: number;
}
declare class UTCDate {
    readonly year: number;
    readonly month: number;
    readonly date: number;
    constructor(props?: UTCDateProps);
    UNIX(): number;
    gte(date: UTCDate): boolean;
    lte(date: UTCDate): boolean;
    range(to_date: UTCDate): UTCDate[];
    static fromSerialized(serialized_date: string): UTCDate;
    toSerialized(): string;
    static fromNormalDate(dt: Date): UTCDate;
    toNormalDate(): Date;
    getMonthName(): any;
}
export default UTCDate;
