import clsx from "clsx"
import { Fragment, useState } from "react"
import DB from "../../DB"
import { Positions } from "../../db-typings/electron/Models"
import useAsyncRefresh from "../../reusable/hooks/useAsyncRefresh"
import styles from "./EditPositions.module.scss"
import { IoMdClose } from "react-icons/io"
import PositionsDrawer from "./PositionsDrawer"
import PositionBoxSkeleton from "../Positions/PositionBoxSkeleton"
import useReRender from "../../reusable/hooks/useReRender"
import PositionGridSkeleton from "../Positions/PositionGridSkeleton"

const EditPositions = () => {
    const {ReRender, counter} = useReRender()
    
    const {value: positions_value} = useAsyncRefresh(() => DB.Positions.GetAll(), [counter])
    const positionMap = Object.fromEntries(
        positions_value?.result.map(position => [position.position, position]) ?? []
    )
    const [selected, setSelected] = useState<Positions | null>(null)
    
    return (
        <Fragment>
            <PositionsDrawer positions={positions_value?.result} setSelected={setSelected} selected={selected} />
            <PositionGridSkeleton className={styles.positions}>
                {new Array(18).fill(null).map((_, i) => {
                    const position = positionMap[i] as Positions | undefined
                    return (
                        <PositionBoxSkeleton
                        key={i}
                        className={clsx(selected && styles.selected, typeof position === "undefined" && styles.empty)}
                        onClick={typeof position !== "undefined" || selected === null ? undefined : async () => {
                            setSelected(null)   
                            await DB.Positions.UpdateIndex(selected.id, i)
                            ReRender()
                        }}
                        shorthand={position?.shorthand ?? ""}
                        >
                            {typeof position !== "undefined" && (
                                <div
                                className={styles.CloseButton}
                                onClick={async () => {
                                    await DB.Positions.UpdateIndex(position.id, null)
                                    ReRender()
                                }}
                                ><IoMdClose/></div>
                            )}
                        </PositionBoxSkeleton>
                    )
                })}
            </PositionGridSkeleton>
        </Fragment>
    )
}

export default EditPositions