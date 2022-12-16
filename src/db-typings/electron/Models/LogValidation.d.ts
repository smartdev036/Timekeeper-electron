interface LogValidation {
    position_id: number;
    log_date: string;
    timestamp: number;
}
declare class LogValidation {
    static Add(position_id: number, log_date: string): Promise<void>;
    static GetAllValidations(log_date: string): Promise<LogValidation[]>;
    static UnValidated(log_date: string): Promise<number>;
    static ValidationCalendar(from_log_date: string, to_log_date: string): Promise<{
        [date: string]: number;
    }>;
}
export default LogValidation;
