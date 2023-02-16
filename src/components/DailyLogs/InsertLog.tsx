import { useEffect, useState } from "react"
import DB, { ElectronAlert } from "../../DB"
import { LogTimes, Positions } from "../../db-typings/electron/Models"
import Button from "../../inputs/Button"
import Container from "../../reusable/components/Container"
import Popup from "../../reusable/components/Popup"
import useAsyncRefresh from "../../reusable/hooks/useAsyncRefresh"
import useReRender from "../../reusable/hooks/useReRender"
import LocalDate from "../../reusable/LocalDate"
import LocalTime from "../../reusable/LocalTime"
import ControllerInput from "../Positions/ControllerInput"
import StateTimePicker from "../Positions/TimePicker"
import styles from "./InsertLog.module.scss"

interface OptionType {
    label: string
    id: number
}

interface InsertLogProps {
    trigger: React.ReactElement
    position: Positions
    log_date: string;
}

const InsertLog = ({position, trigger, log_date}: InsertLogProps) => {
    const {ReRender, counter} = useReRender()

    const {value: controller_value} = useAsyncRefresh(() => DB.Controller.GetAll(), [DB, counter])
    const controllers: OptionType[] = (controller_value?.result.map(controller => ({
        label: `${controller.initials} - ${controller.first_name} ${controller.last_name}`,
        id: controller.id
    })) ?? [])

    const PopupOpenState = useState(false)

    const State = {
        time: useState<LocalTime | null>(new LocalTime()),
        controller: useState<OptionType | null>(null),
        trainee: useState<OptionType | null>(null),
    }

    const TimeErrorState = useState<string | null>(null)

    const HandleAdd = async () => {
        if (State.time[0] === null) return
        if (State.controller[0] === null) return
        if (TimeErrorState[0]) return setTimeout(() => ElectronAlert("Enter a valid time."))

        await DB.LogTimes.Add({
            position_id: position.id,
            controller_id: State.controller[0].id,
            trainee_controller_id: State.trainee[0]?.id ?? 0,
            log_date: log_date,
            start_time: State.time[0].toSerialized(),
        })

        PopupOpenState[1](false)

        // Initialize the time and value
        State.time[1](new LocalTime())
        State.controller[1](null)
        State.trainee[1](null)  
        ReRender()
    }

    const HandleClose = async () => {
        if (State.time[0] === null) {
            return setTimeout(() => ElectronAlert("Set close time."))
        }
        if (TimeErrorState[0]) return setTimeout(() => ElectronAlert("Enter a valid time."))
        
        await DB.LogTimes.Close({
            position_id: position.id,
            log_date: log_date,
            start_time: State.time[0].toSerialized(),
        })
        PopupOpenState[1](false)

        // Initialize the time and value
        State.time[1](new LocalTime())
        State.controller[1](null)
        State.trainee[1](null)
  
        ReRender()
    }

    const isDateToday = log_date === (new LocalDate()).toSerialized()

    return (
        <Popup trigger={trigger} state={PopupOpenState} >
            <Container className={styles.PopupInner} noMargin={true}>
                <Container noMargin={true} className={styles.PopupHeading}>
                    <div>{position.name}</div>
                    <div>({position.shorthand})</div>
                </Container>
                <Container className={styles.PopupInputs} width="70%">
                    <StateTimePicker
                    label="Time"
                    state={State.time}
                    required
                    shouldDisableFuture={isDateToday}
                    setError={TimeErrorState[1]}
                    />
                    <ControllerInput
                    label="Controller"
                    state={State.controller}
                    required
                    exclude={[State.trainee[0]?.id ?? 0]}
                    until={{
                        date: log_date,
                    }}
                    />
                    <ControllerInput
                    label="Trainee (Optional)"
                    state={State.trainee}
                    exclude={[State.controller[0]?.id ?? 0]}
                    />
                </Container>
                <Container className={styles.PopupButtons} dir="row" >
                    <Button label="Closed" onClick={HandleClose} />
                    <Button label="Insert" onClick={HandleAdd} />
                </Container>
            </Container>
        </Popup>
    )
}

export default InsertLog