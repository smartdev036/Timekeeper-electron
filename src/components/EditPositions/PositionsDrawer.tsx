import { Positions } from "../../db-typings/electron/Models"
import Button from "../../inputs/Button"
import Container from "../../reusable/components/Container"
import Drawer from "../../reusable/components/Drawer"
import Heading from "../../reusable/components/Heading"
import PositionMiniBoxGrid from "./PositionMiniBoxGrid"
import styles from "./PositionsDrawer.module.scss"
import PositionsPopup from "./PositionsPopup"

interface PositionDrawerProps {
    positions?: Positions[]
    selected: Positions | null
    setSelected: React.Dispatch<React.SetStateAction<Positions | null>>
}

const PositionsDrawer = (props: PositionDrawerProps) => {
    return (
        <Drawer trigger={<Button label="Available Positions" size="large" />} >
            <Heading level="h3" label="Available Positions" /> 
            {props.positions && (
                <PositionMiniBoxGrid
                positions={props.positions.filter(position => position.position === null)}
                selected={props.selected}
                onSelect={position => props.setSelected(position)}
                />
            )}
            <Container dir="row">
                <PositionsPopup
                trigger={<Button push="right" label="Edit" hidden={!props.selected} size="small" className={styles.EditButton} ></Button>}
                position={props.selected}
                onAction={open => !open && props.setSelected(null)}
                />
                <PositionsPopup
                trigger={<Button push={!props.selected ? "right" : undefined} label="Create" size="small" />}
                position={null}
                onAction={open => !open && props.setSelected(null)}
                />
            </Container>
        </Drawer>
    )
}

export default PositionsDrawer