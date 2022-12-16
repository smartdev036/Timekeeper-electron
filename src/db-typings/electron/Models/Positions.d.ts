interface Positions {
    id: number;
    name: string;
    shorthand: string;
    position: number | null;
    relief_exempt: number;
    relief_time_min: number;
    proficiency_time_min: number;
    created_date: string;
}
declare class Positions {
    static GetAll(until_date?: string): Promise<Positions[]>;
    static Insert(position: Positions): Promise<number>;
    static Update(position: Positions): Promise<void>;
    static UpdateIndex(id: number, position: number | null): Promise<void>;
    static Delete(id: number): Promise<void>;
}
export default Positions;
