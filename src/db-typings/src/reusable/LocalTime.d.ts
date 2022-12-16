import LocalDate from "./LocalDate";
import UTCTime from "./UTCTime";
interface LocalTimeProps {
    hour: number;
    minute: number;
    second: number;
}
declare class LocalTime {
    readonly hour: number;
    readonly minute: number;
    readonly second: number;
    constructor(props?: LocalTimeProps);
    static fromSerialized(serialized_time: number): LocalTime;
    toSerialized(): number;
    formatToString(): string;
    static convertFromUTC(utcTime: UTCTime): LocalTime;
    convertToUTC(): UTCTime;
    static getTimeZone(): string;
    mergeDate(date: LocalDate): Date;
}
export default LocalTime;
