interface Controller {
    id: number;
    first_name: string;
    last_name: string;
    initials: string;
}
declare class Controller {
    static GetAll(): Promise<(Controller & {
        crew_id: string | null;
        crew_name: string | null;
    })[]>;
    static Insert(controller: Controller): Promise<number>;
    static Update(controller: Controller): Promise<void>;
    static Delete(controller_id: number): Promise<void>;
    static UpdateCrew(controller_id: number, crew_id: number): Promise<void>;
}
export default Controller;
