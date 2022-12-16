interface Crew {
    id: number;
    name: string;
}
declare class Crew {
    static GetAll(): Promise<Crew[]>;
    static Insert(crew: Crew): Promise<number>;
    static Update(crew: Crew): Promise<void>;
}
export default Crew;
