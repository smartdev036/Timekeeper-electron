import { Close, Open } from "./Core"
import { AsObject, assert } from "./Helpers"
import LocalDate from "../../src/reusable/LocalDate"
import LocalTime from "../../src/reusable/LocalTime"
import { Database } from "sql.js"

interface PositionCombinations {
    id: number
    position_id: number
}

interface CombinedCenter {
    id: number
    position_id: number
}

class PositionCombinations {

    static async getMaxId() {
        const db = await Open()
        const result = AsObject<any>(db.exec(
            `select max(id) as id from tbl_pos_combined_integration`
        ))
        return (result.length) ? result[0].id + 1 : 1
    }

    static async insert_tbl_pos($center_id: number, $combined_id: number, $log_date: string) {
        const db = await Open()
        const $maxId = await PositionCombinations.getMaxId()
        const result = AsObject<any>(db.exec(
            `
            INSERT INTO tbl_pos_combined_integration('id', 'center_id', 'combined_id', 'log_date') 
            VALUES ($maxId, $center_id, $combined_id, $log_date);
        `, {
            $maxId,
            $center_id,
            $combined_id,
            $log_date
        }
        ))
        Close(db, true)
        return result
    }


    static async delete_tbl_pos($deleteId: number) {
        const db = await Open()
        const result = AsObject<any>(db.exec(
            `
            DELETE from tbl_pos_combined_integration
            where 'id' = $deleteId;
        `, {
            $deleteId
        }
        ))
        Close(db, true)
        return result
    }

    static nFindLastIndex(arr: any[], item: any) {
        let id = [...arr].reverse().findIndex(a => a?.combined_id === item)
        return id === -1 ? -1 : (arr.length - 1 - id)
    }

    static async MapPositionCombined(positionMap: any[], position_id: number) {
        let resArr: any[] = []
        let newId = 0
        positionMap.forEach((item: any, idx: number) => {
            let cid = item.center_id
            let pid = item.combined_id

            let isIncludeDecombinePosition = 0

            // let csh = item.center_sh
            // let psh = item.combined_sh
            console.log('lastIndex: ', idx,  item, PositionCombinations.nFindLastIndex(positionMap, pid), PositionCombinations.nFindLastIndex(positionMap, cid))
            
            // If one is already added per PID
            if (resArr.filter(it => it.leaf_id == pid).length > 0) return
            // If the current row is not useful because the later row is the nFindLast Row
            if (idx !== PositionCombinations.nFindLastIndex(positionMap, pid)) return

            while (true) {
                // If the next center is the current Position
                let currentIndex = PositionCombinations.nFindLastIndex(positionMap, pid)
                if ( positionMap[currentIndex].center_id === position_id) {
                    isIncludeDecombinePosition = 1                    
                    cid = positionMap[currentIndex].center_id
                    pid = positionMap[currentIndex].combined_id
                    break
                }

                // Find the next direction row 
                let lastIndex = PositionCombinations.nFindLastIndex(positionMap, cid)
                if (lastIndex == -1) {
                    break
                }
                console.log('lastIndex-detail: ', lastIndex, item, cid, positionMap[lastIndex].center_id)
                cid = positionMap[lastIndex].center_id
                pid = positionMap[lastIndex].combined_id
                if (pid === cid) {
                    break
                }
                // csh = positionMap[lastIndex].center_sh
                // psh = positionMap[lastIndex].combined_sh
            }

            if (isIncludeDecombinePosition === 1) {
                newId += 1
                resArr.push({
                    id: newId,
                    center_id: cid,
                    leaf_id: item.combined_id,
                    // center_sh: csh,
                    // leaf_sh: psh,
                })
            }
        })
        return resArr

    }

    static async TestDBCall($log_date: string, position_id: number) {
        const db = await Open()
        const foundCombined = AsObject<any>(db.exec(
            `          
            SELECT *
            from tbl_pos_combined_integration
            where log_date=$log_date
            `, {
            $log_date
        }
        ))

        console.log('found-combined: ', foundCombined, position_id)

        let result = PositionCombinations.MapPositionCombined(foundCombined, position_id)
        return result
        // return foundCombined

    }

    static __public_CleanupCombine(...args: Parameters<typeof PositionCombinations["CleanupCombine"]>) {
        return PositionCombinations.CleanupCombine(...args)
    }
    private static async CleanupCombine(db: Database, $log_date: string) {
        db.run(
            `
            DELETE FROM positions_combined WHERE id IN (
                SELECT id FROM positions_combined
                WHERE log_date = $log_date
                GROUP BY id
                HAVING COUNT(*) < 2
            );
            `, {
            $log_date
        }
        )
        db.run(
            `
            DELETE FROM combined_center WHERE id NOT IN (
                SELECT DISTINCT id FROM positions_combined
                WHERE log_date = $log_date
            );
            `, {
            $log_date
        }
        )
    }

    static __public_UpsertCenter(...args: Parameters<typeof PositionCombinations["UpsertCenter"]>) {
        return PositionCombinations.UpsertCenter(...args)
    }
    private static async UpsertCenter(db: Database, $id: number, $position_id: number, $log_date: string) {
        db.run(`
            INSERT OR REPLACE INTO combined_center (id, position_id, log_date)
            VALUES ($id, $position_id, $log_date)
        `, {
            $id,
            $position_id,
            $log_date
        })
    }

    static async Combine(position_A: number, position_B: number, log_date?: string, start_time?: number) {
        // position_A is being combined with position_b, so it should be the center
        const db = await Open()

        const $log_date = log_date ?? new LocalDate().toSerialized()


        // BEGIN-New Update(Smart)    (B -> A)
        await PositionCombinations.insert_tbl_pos(position_B, position_A, $log_date)
        const $start_time = start_time ?? new LocalTime().toSerialized()
        // END-New Update(Smart)

        // When A is combined with another position:
        // Not possible as it should only have the decombine option.

        // When another position is combining with A:
        // A, and all positions with it will be assigned the same log as B.
        // All positions will now be combined with B.

        // When B is combined with another position:
        // A, and all associated positions will be assigned the same log as B (same as the other position).
        // All positions will now be assigned to the other position.

        // When other positions are combined with B:
        // A, and all associated positions will be assigned the same log as B.
        // All positions will now be assigned to B.

        // This ensures that when we pull positions_combined,
        // they will only return is position is actually combined.
        PositionCombinations.CleanupCombine(db, $log_date)

        const foundCombined = AsObject<PositionCombinations>(db.exec(
            `
            SELECT * FROM positions_combined
            WHERE position_id IN ($position_A, $position_B)
            AND log_date = $log_date
            `, {
            $position_A: position_A,
            $position_B: position_B,
            $log_date
        }
        ))

        // > When B is empty:
        // Throw error “B cannot be empty”

        // Is position B empty?
        const isPositionBEmpty = AsObject<{
            start_time: number
        }>(db.exec(`
        SELECT start_time
        FROM log_times
        WHERE log_date = $log_date
        AND position_id = $position_B
        ORDER BY start_time DESC
        LIMIT 1
        `, {
            $log_date,
            $position_B: position_B
        })).length === 0

        if (isPositionBEmpty) {
            throw new Error("position_B is empty")
        }
        console.log("foundCombined", foundCombined);

        const id = (() => {
            if (foundCombined.length === 0) {
                console.log("foundCombined.length === 0")
                // -> When A is (empty or full) AND B is full:
                // A will be assigned the same log as B.
                // A will share combination with B.

                // We know B is not empty, and that neither are combined.
                // So this condition matches.

                // If Neither are combined
                // -> Insert position_A with new combination id
                db.run(`
                INSERT INTO positions_combined (id, position_id, log_date)
                VALUES (
                    COALESCE((SELECT MAX(id) + 1 FROM positions_combined WHERE log_date = $log_date), 1),
                    $position_A,
                    $log_date
                );
                `, {
                    $position_A: position_A,
                    $log_date
                })
                // Use Max() i.e: position_A's newly generated id, add Position_B to it.
                db.run(`
                INSERT INTO positions_combined (id, position_id, log_date)
                VALUES (
                    (SELECT MAX(id) FROM positions_combined WHERE log_date = $log_date),
                    $position_B,
                    $log_date
                );
                `, {
                    $position_B: position_B,
                    $log_date
                })

                // Get Max() i.e: position A and B's new id, and return it
                const id = db.exec(
                    "SELECT MAX(id) FROM positions_combined WHERE log_date = $log_date;",
                    { $log_date }
                )[0].values[0][0] as number;

                // Now, both position A and B share the combination id {id}

                // A should be assigned the same log as B.

                ; (db.run(`
                    INSERT INTO log_times
                    SELECT * FROM (
                        SELECT $position_A, controller_id, trainee_controller_id, log_date, $start_time AS st
                        FROM log_times
                        WHERE log_date = $log_date
                        AND position_id = $position_B
                        ORDER BY start_time DESC
                        LIMIT 1
                    )
                `, {
                    $position_A: position_A,
                    $position_B: position_B,
                    $log_date,
                    $start_time: $start_time,
                }))

                PositionCombinations.__public_UpsertCenter(db, id, position_B, $log_date)

                return id

            } else if (foundCombined.length === 1) {
                if (foundCombined[0].position_id === position_A) {
                    // This is when another position is already combined with A
                    // This cannot be when A is combined with another position, as
                    // that requires decombining first.
                    // So in theory, only first condition should ever be triggerred.
                    console.log("foundCombined.length === 1, position_A")
                    // -> When another position is combined with A:
                    // A, and all positions combined with it will be assigned the same log as B.
                    // A, and all positions combined with it will share combination with B

                    // Get all positions that are combined with A
                    const positionsCombinedWithA = AsObject<{
                        position_id: number
                    }>(db.exec(`
                    SELECT position_id
                    FROM positions_combined
                    WHERE id = $id AND log_date = $log_date
                    `, {
                        $id: foundCombined[0].id,
                        $log_date
                    })).map(({ position_id }) => position_id)


                    // Generate new ID for position B

                    db.run(`
                    INSERT INTO positions_combined (id, position_id, log_date)
                    VALUES (COALESCE((SELECT MAX(id) + 1 FROM positions_combined WHERE log_date = $log_date), 1), $position_B, $log_date);
                    `, {
                        $position_B: position_B,
                        $id: foundCombined[0].id,
                        $log_date
                    })

                    // Update position A, and all combined with it to share the ID generated for B.
                    db.run(`
                    UPDATE positions_combined
                    SET id = (SELECT MAX(id) FROM positions_combined WHERE log_date = $log_date)
                    WHERE id = $id
                    AND log_date = $log_date
                    `, {
                        $id: foundCombined[0].id,
                        $log_date
                    })

                    // We're now using this new ID, that B, A, and all positions combined with A use.
                    const id = db.exec(
                        "SELECT MAX(id) FROM positions_combined WHERE log_date = $log_date;",
                        { $log_date }
                    )[0].values[0][0] as number;


                    // Now updating logs for A, and all positions that were combined with it.
                    // const $start_time = new LocalTime().toSerialized()
                    for (const position_id of positionsCombinedWithA) {
                        ; (db.run(`
                            INSERT INTO log_times
                            SELECT * FROM (
                                SELECT $position_to_be_updated, controller_id, trainee_controller_id, log_date, $start_time AS st
                                FROM log_times
                                WHERE log_date = $log_date
                                AND position_id = $position_B
                                ORDER BY start_time DESC
                                LIMIT 1
                            )
                        `, {
                            $position_to_be_updated: position_id,
                            $position_B: position_B,
                            $log_date,
                            $start_time
                        }))
                    }

                    // All positions combined with A, and A itself have now been combined with B, with B being the center.
                    PositionCombinations.UpsertCenter(db, id, position_B, $log_date)

                    return id
                } else if (foundCombined[0].position_id === position_B) {
                    // This is automatically setting the center, as position_B's group should have a center already.
                    // Position A is being assigned to the same group as B.

                    console.log("foundCombined.length === 1 position_B")
                    // This can have two cases:
                    // 1) B is combined with another position, in which case we want to:
                    // -> Assign the same log to A as the other position
                    // -> Make A share the same share ID as the other position
                    // 2) Another position is combined with B, in that case:
                    // -> Assign the same log to A as B
                    // -> Make A share the same share ID as B

                    // Both of these cases are actually the same, since the "other position", in both cases,
                    // will have the same log and same share ID as B

                    // What we just need to do is
                    // Assign the same log to A as B
                    // Make A share the same share combination as B

                    const positionB_ID = foundCombined[0].id

                    // Now making A and B share the same combination
                    db.run(`
                    INSERT INTO positions_combined (id, position_id, log_date)
                    VALUES ($id, $position_A, $log_date);
                    `, {
                        $id: positionB_ID,
                        $position_A: position_A,
                        $log_date
                    })

                        // Now A has the same log as B
                        ; (db.run(`
                        INSERT INTO log_times
                        SELECT * FROM (
                            SELECT $position_A, controller_id, trainee_controller_id, log_date, $start_time AS st
                            FROM log_times
                            WHERE log_date = $log_date
                            AND position_id = $position_B
                            ORDER BY start_time DESC
                            LIMIT 1
                        )
                    `, {
                            $position_A: position_A,
                            $position_B: position_B,
                            $log_date,
                            // $start_time: new LocalTime().toSerialized()
                            $start_time,
                        }))

                    return positionB_ID

                } else { throw Error }
            } else if (foundCombined.length === 2) {
                // This is automatically setting the center, as position_B's group should have a center already.
                // Position A is being assigned to the same group as B.

                console.log("foundCombined.length === 2")
                if (foundCombined[0].id !== foundCombined[1].id) {
                    const position_A_id = foundCombined.find(row => row.position_id === position_A)?.id ?? 0
                    const position_B_id = foundCombined.find(row => row.position_id === position_B)?.id ?? 0
                    if (position_B_id === 0 || position_A_id === 0) throw new Error

                    // -> When both A and B are combined with different positions:
                    // A, and all positions combined with it will be assigned the same log as B.
                    // A, and all positions combined with it will share combination with B

                    // Get all positions that are combined with A
                    const positionsCombinedWithA = AsObject<{
                        position_id: number
                    }>(db.exec(`
                    SELECT position_id
                    FROM positions_combined
                    WHERE id = $id AND log_date = $log_date
                    `, {
                        $id: position_A_id,
                        $log_date
                    })).map(({ position_id }) => position_id)


                    // Update position_A with the position_B id
                    db.run(`
                    UPDATE positions_combined
                    SET id = $position_B_id
                    WHERE id = $position_A_id AND log_date = $log_date
                    `, {
                        $position_B_id: position_B_id,
                        $position_A_id: position_A_id,
                        $log_date
                    })
                    // Now position A, and positions combined with it share a combination with B.

                    // Now updating logs for A, and all positions that were combined with it.
                    // const $start_time = new LocalTime().toSerialized()

                    for (const position_id of positionsCombinedWithA) {
                        ; (db.run(`
                            INSERT INTO log_times
                            SELECT * FROM (
                                SELECT $position_to_be_updated, controller_id, trainee_controller_id, log_date, $start_time AS st
                                FROM log_times
                                WHERE log_date = $log_date
                                AND position_id = $position_B
                                ORDER BY start_time DESC
                                LIMIT 1
                            )
                        `, {
                            $position_to_be_updated: position_id,
                            $position_B: position_B,
                            $log_date,
                            $start_time,
                        }))
                    }

                    return position_B_id
                } else {
                    // Already exists
                    throw new Error("Already exists")
                }
            } else { throw new Error("what") }
        })()


        Close(db, true)

        return id
    }

    static async GetCombinations(log_date?: string) {
        const $log_date = log_date ?? new LocalDate().toSerialized()

        const db = await Open()

        const result = AsObject<PositionCombinations>(db.exec(`
        SELECT * FROM positions_combined
        WHERE log_date = $log_date
        ORDER BY position_id ASC
        `, { $log_date }))

        const combinations: {
            [id: number]: number[]
        } = {}

        result.forEach(row => {
            combinations[row.id] = combinations[row.id] ?? []
            combinations[row.id].push(row.position_id)
        })

        const position_combinations: {
            [position_id: number]: number[]
        } = {}

        result.forEach(row => {
            position_combinations[row.position_id] = [...combinations[row.id]]
        })

        Close(db, false)

        return position_combinations
    }

    static async Decombine(position_id: number, log_date?: string) {
        assert(position_id !== 0)

        const $log_date = log_date ?? new LocalDate().toSerialized()
        const db = await Open()

        // Make position_id to center in positions_combined 
        // If any position is combined to position_id, doesn't effect to CleanupCombine
        // If it is the only position, it removed by CleanupCombine 

        // Update all positions_combined, combined_center to final destination from 

        const position_rows = AsObject<{
            id: number,
            position_id: number,
            log_date: string
        }>(db.exec(
            `
                SELECT id, position_id,log_date FROM combined_center
                WHERE position_id = $position_id
                AND log_date = $log_date
            `, {
            $position_id: position_id,
            $log_date: $log_date
        }
        ));
        let center_pos_id: number = 0
        if (position_rows.length == 0) {
            center_pos_id = AsObject<{
                maxId: number
            }>(db.exec(`
            SELECT MAX(id) + 1 as maxId FROM positions_combined WHERE log_date = $log_date
            `, { $log_date: $log_date }))[0].maxId

            // Add new Position_Center
            PositionCombinations.UpsertCenter(db, center_pos_id, position_id, $log_date)

        } else {
            center_pos_id = position_rows[0].id
            // Update new Position_Center
            PositionCombinations.UpsertCenter(db, center_pos_id, position_id, $log_date)
        }

        // Add children to position_combined
        // reMap is a array that includes only children, not parents
        let reMap = await PositionCombinations.TestDBCall($log_date, position_id)
        reMap.forEach(item => {
            db.run(`
                UPDATE positions_combined 
                SET id=$center_pos_id 
                WHERE position_id = $position_id
                and log_date = $log_date
                `, {
                $center_pos_id: center_pos_id,
                $position_id: item.leaf_id,
                $log_date: $log_date
            })
        })

        // Add self to position_combined
        db.run(`
            UPDATE positions_combined 
            SET id=$center_pos_id 
            WHERE position_id = $position_id
            and log_date = $log_date
            `, {
            $center_pos_id: center_pos_id,
            $position_id: position_id,
            $log_date: $log_date
        })

        console.log('POSITION: REMAP: ', position_rows, center_pos_id, position_id, reMap)

        PositionCombinations.CleanupCombine(db, $log_date)

        Close(db, true)
    }

    static async GetCombinationsCenter(log_date?: string) {
        const $log_date = log_date ?? new LocalDate().toSerialized()

        const db = await Open()

        const result = AsObject<CombinedCenter>(db.exec(`
        SELECT * FROM combined_center
        WHERE log_date = $log_date
        ORDER BY position_id ASC
        `, { $log_date }))

        const id_centers: {
            [id: number]: number
        } = Object.fromEntries(result.map(row => ([row.id, row.position_id])))

        const position_centers: {
            [position_id: number]: number | undefined
        } = Object.fromEntries(AsObject<PositionCombinations>(db.exec(`
        SELECT * FROM positions_combined
        WHERE log_date = $log_date
        ORDER BY position_id ASC
        `, { $log_date })).map(row => {
            const center: number | undefined = id_centers[row.id]
            return [row.position_id, center]
        }))

        Close(db, false)

        return position_centers

    }
}

export default PositionCombinations