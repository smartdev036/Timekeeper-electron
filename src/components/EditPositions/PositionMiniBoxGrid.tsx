import clsx from "clsx"
import { Fragment } from "react"
import { Positions } from "../../db-typings/electron/Models"
import Button from "../../inputs/Button"
import Container from "../../reusable/components/Container"
import styles from "./PositionMiniBoxGrid.module.scss"

interface PositionMiniBoxGridProps {
    positions: Positions[]
    selected: Positions | null
    onSelect: (position: Positions | null) => void
}

const PositionMiniBoxGrid = (props: PositionMiniBoxGridProps) => {
    const { positions } = props
    const rows = Math.ceil((positions.length ?? 0) / 2)

    return (
        <Fragment>
            {rows ? null : <Container className={styles.Nothing}>No available positions</Container>}
            <div className={styles.SelectionGrid} style={{
                gridTemplateRows: `repeat(${rows}, 1fr)`
            }}>
                {positions.map(position => (
                    <Button
                    key={position.id}
                    label={position.shorthand}
                    width="100%"
                    className={clsx(props.selected?.id === position.id && styles.selected)}
                    onClick={() => props.onSelect(position)}
                    />
                ))}
            </div>

        </Fragment>
    )
}

export default PositionMiniBoxGrid