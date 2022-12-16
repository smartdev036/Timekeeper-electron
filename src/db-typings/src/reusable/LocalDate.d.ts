interface LocalDateProps {
    year: number;
    month: number;
    date: number;
}
declare class LocalDate {
    readonly year: number;
    readonly month: number;
    readonly date: number;
    constructor(props?: LocalDateProps);
    UNIX(): number;
    gte(date: LocalDate): boolean;
    lte(date: LocalDate): boolean;
    range(to_date: LocalDate): LocalDate[];
    static fromSerialized(serialized_date: string): LocalDate;
    toSerialized(): string;
    static fromNormalDate(dt: Date): LocalDate;
    toNormalDate(): Date;
    getMonthName(): any;
}
export default LocalDate;
