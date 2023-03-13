interface Appsetting {
    id: number;
    isdaylight: number;
}
declare class Appsetting {
    static GetAll(): Promise<Appsetting[]>;
    static GetDaylight(): Promise<number>;
    static UpdateIsDaylight(isdaylight: number): Promise<number>;
}
export default Appsetting;
