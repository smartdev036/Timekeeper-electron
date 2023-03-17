import { Positions } from ".";
export declare const LOG_HISTORY_HISTORY: string;
interface LogTimes {
    position_id: number;
    controller_id: number;
    trainee_controller_id: number;
    log_date: string;
    start_time: number;
}
export declare type ReportTypes = "protime" | "trainer";
declare class LogTimes {
    private static RemoveCombinationsIfEmpty;
    static Add(log_time: LogTimes, isClosing?: boolean): Promise<void>;
    static Update(prev_log_time: LogTimes, log_time: LogTimes, canDelete?: boolean): Promise<void>;
    static Delete(position_id: number, log_date: string, start_time: number): Promise<void>;
    static Close(log_time: {
        position_id: number;
        log_date: string;
        start_time: number;
    }): Promise<void>;
    static GetAllPositionsStatus(log_date: string, until_time?: number): Promise<(LogTimes & {
        controller_initials: string;
        trainee_initials: string;
    })[]>;
    static GetAllPositionsStatusValues(log_date: string, until_time?: number): Promise<(LogTimes & {
        controller_initials: string;
        trainee_initials: string;
    })[]>;
    static GetAllLogs(position_id: number, log_date: string): Promise<(LogTimes & {
        controller_initials: string;
        trainee_initials: string;
    })[]>;
    static GetReport(type: ReportTypes, start_date: string, end_date: string): Promise<{
        controller_id: number;
        position_id: number;
        duration: number;
    }[]>;
    static SaveDailyLog(data: {
        position: Positions;
        logtimes: any;
    }[], log_date: string): Promise<{
        success: boolean;
        msg: string;
    }>;
}
export default LogTimes;
