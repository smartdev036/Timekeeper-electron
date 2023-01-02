import { Controller } from ".";
declare type BullpenTypes = "controller";
interface Bullpen {
    type: BullpenTypes;
    id: number;
    time_since_lastin: string;
}
declare class Bullpen {
    static Add(id: number): Promise<void>;
    static AddWithActiveTime(id: number, time_since_lastin: string): Promise<void>;
    static AddWithActiveTest(id: number): Promise<void>;
    static UpdateTimeSinceInActive(controllerId: number, time_since_lastin: string): Promise<void>;
    static AddCrew(id: number): Promise<void>;
    static Delete(id: number): Promise<void>;
    static GetAll(filterBusyDate: string | null, until_time?: number): Promise<(Bullpen & Controller)[]>;
}
export default Bullpen;
