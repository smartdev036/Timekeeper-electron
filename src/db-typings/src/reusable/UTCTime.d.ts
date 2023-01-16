import UTCDate from "./UTCDate";
interface UTCTimeProps {
    hour: number;
    minute: number;
    second: number;
}
declare class UTCTime {
    readonly hour: number;
    readonly minute: number;
    readonly second: number;
    constructor(props?: UTCTimeProps);
    static fromSerialized(serialized_time: number): UTCTime;
    toSerialized(): number;
    formatToZ(): string;
    formatToWithoutZ(): string;
    mergeDate(date: UTCDate): Date;
}
export default UTCTime;
