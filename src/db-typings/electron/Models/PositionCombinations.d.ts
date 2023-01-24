interface PositionCombinations {
    id: number;
    position_id: number;
}
declare class PositionCombinations {
    static getMaxId(): Promise<any>;
    static insert_tbl_pos($center_id: number, $combined_id: number, $log_date: string): Promise<any[]>;
    static delete_tbl_pos($deleteId: number): Promise<any[]>;
    static nFindLastIndex(arr: any[], item: any): number;
    static MapPositionCombined(positionMap: any[]): Promise<any[]>;
    static TestDBCall($log_date: string): Promise<any[]>;
    static __public_CleanupCombine(...args: Parameters<typeof PositionCombinations["CleanupCombine"]>): Promise<void>;
    private static CleanupCombine;
    static __public_UpsertCenter(...args: Parameters<typeof PositionCombinations["UpsertCenter"]>): Promise<void>;
    private static UpsertCenter;
    static Combine(position_A: number, position_B: number, log_date?: string): Promise<number>;
    static GetCombinations(log_date?: string): Promise<{
        [position_id: number]: number[];
    }>;
    static Decombine(position_id: number, log_date?: string): Promise<void>;
    static GetCombinationsCenter(log_date?: string): Promise<{
        [position_id: number]: number | undefined;
    }>;
}
export default PositionCombinations;
