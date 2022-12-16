import { useState } from "react"
import DB from "../../DB"
import { LogTimes, Positions } from "../../db-typings/electron/Models"
import Button from "../../inputs/Button"
import Container from "../../reusable/components/Container"
import Popup from "../../reusable/components/Popup"
import useAsyncRefresh from "../../reusable/hooks/useAsyncRefresh"
import useReRender from "../../reusable/hooks/useReRender"
import LocalDate from "../../reusable/LocalDate"
import PositionBoxSkeleton from "../Positions/PositionBoxSkeleton"
import EditLog from "./EditLog"
import ValidationStatus from "./ValidationStatus"
import styles from "./ValidationPopup.module.scss"
import LocalTime from "../../reusable/LocalTime"

interface ValidationPopupInnerProps {
    date: LocalDate
    position: Positions
    closePopup: () => void
}

const ValidationPopupInner = ({position, ...props}: ValidationPopupInnerProps) => {
    const {ReRender, counter} = useReRender()
    const {value: logs_value} = useAsyncRefresh(
        () => DB.LogTimes.GetAllLogs(position.id, props.date.toSerialized()),
        [DB, counter]
    )
    const handleValidate = async () => {
        await DB.LogValidation.Add(position.id, props.date.toSerialized())
        ReRender()
        props.closePopup()
    }

    const HandleDelete = async (log: LogTimes & {
        controller_initials: string;
        trainee_initials: string;
    }) => {
        await DB.LogTimes.Delete(log.position_id, log.log_date, log.start_time)
        ReRender()
    }

    return (
        <Container>
            <Container noMargin={true} className={styles.PopupHeading}>
                <div>{position.name}</div>
                <div>({position.shorthand})</div>
            </Container>
            <Container className={styles.LogTimesContainer}>
            {
                logs_value?.result.map(log => {
                    const startTime = LocalTime.fromSerialized(log.start_time)
                    return (
                        <Container noMargin={true} key={log.start_time} className={styles.log}>
                            <div><strong>Time:</strong> {startTime.convertToUTC().formatToZ()} | {startTime.formatToString()}</div>
                            <div>
                                <Container dir="row">
                                    {log.controller_id === 0 ? (
                                        <span><strong>Closed</strong></span>
                                    ) : (
                                        <span><strong>Controller:</strong> {log.controller_initials}</span>
                                    )}
                                    {log.trainee_initials && <span><strong>Trainee:</strong> {log.trainee_initials}</span>}
                                </Container>
                            </div>
                            <Container className={styles.ActionButton} dir="row" width="fit-content">
                                <EditLog
                                position={position}
                                trigger={<Button label="Edit" />}
                                log={log}
                                />
                                <Button label="Delete" onClick={() => HandleDelete(log)} />
                            </Container>
                        </Container>
                    )
                })
            }
            </Container>
            {logs_value?.result.length === 0 && <Container>No entries found.</Container>}
            <Container dir="row">
                <Button push="right" label="Cancel" onClick={props.closePopup} />
                <Button label="Validate" onClick={handleValidate} />
            </Container>
        </Container>
    )
}

interface ValidationPopupProps {
    date: LocalDate
    validated: boolean
    position: Positions | undefined
}

const ValidationPopup = (props: ValidationPopupProps) => {
    const PopupOpenState = useState(false)
    const { position } = props

    return (
        <Popup
        state={PopupOpenState}
        trigger={
            <PositionBoxSkeleton
            shorthand={position?.shorthand ?? ""}
            hidden={!position?.shorthand}
            >
                <ValidationStatus checked={props.validated} />
            </PositionBoxSkeleton>
        }
        >
            {position && (
                <ValidationPopupInner
                date={props.date}
                position={position}
                closePopup={() => PopupOpenState[1](false)}
                />
            )}
        </Popup>
    )
}

export default ValidationPopup