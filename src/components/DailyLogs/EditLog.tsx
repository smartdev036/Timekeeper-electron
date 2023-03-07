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
import { convertSecondUnitByMinute } from "../../reusable/utils/convertSecondUnit"
import ControllerInput from "../Positions/ControllerInput"
import StateTimePicker from "../Positions/TimePicker"
import styles from "./EditLog.module.scss"

interface OptionType {
    label: string
    id: number
}

interface EditLogProps {
    trigger: React.ReactElement
    position: Positions
    log: LogTimes & {
        controller_initials: string;
        trainee_initials: string;
    }    
}

const EditLog = ({position, trigger, log}: EditLogProps) => {
    const {ReRender, counter} = useReRender()

    const {value: controller_value} = useAsyncRefresh(() => DB.Controller.GetAll(), [DB, counter])
    const controllers: OptionType[] = (controller_value?.result.map(controller => ({
        label: `${controller.initials} - ${controller.first_name} ${controller.last_name}`,
        id: controller.id
    })) ?? [])

    const controller = controllers.find( ({id}) => id === log.controller_id)
    const trainee = controllers.find( ({id}) => id === log.trainee_controller_id)

    const PopupOpenState = useState(false)

    const State = {
        time: useState<LocalTime | null>(LocalTime.fromSerialized(log.start_time)),
        controller: useState<OptionType | null>(controller ?? null),
        trainee: useState<OptionType | null>(trainee ?? null),
    }

    const TimeErrorState = useState<string | null>(null)

    useEffect(() => {
        State.controller[1](controller ?? null)
        State.trainee[1](trainee ?? null)
    }, [JSON.stringify(controller)])

    const HandleAdd = async () => {
        if (State.time[0] === null) return
        if (State.controller[0] === null) return
        if (TimeErrorState[0]) return setTimeout(() => ElectronAlert("Enter a valid time."))

        await DB.LogTimes.Update(log, {
            position_id: log.position_id,
            controller_id: State.controller[0].id,
            trainee_controller_id: State.trainee[0]?.id ?? 0,
            log_date: log.log_date,
            start_time: State.time[0].toSerialized(),
        })

        PopupOpenState[1](false)
        ReRender()
    }

    const HandleClose = async () => {
        if (State.time[0] === null) {
            return setTimeout(() => ElectronAlert("Set close time."))
        }
        if (TimeErrorState[0]) return setTimeout(() => ElectronAlert("Enter a valid time."))
        
        await DB.LogTimes.Update(log, {
            position_id: log.position_id,
            controller_id: 0,
            trainee_controller_id: 0,
            log_date: log.log_date,
            start_time: State.time[0].toSerialized(),
            // trainCalcMinDiffForTraineeee_start_time: State.time[0].toSerialized()
            
        }, true)
        PopupOpenState[1](false)
        ReRender()
    }

    const isDateToday = log.log_date === (new LocalDate()).toSerialized()

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
                        date: log.log_date,
                        time: log.start_time
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
                    <Button label="Save" onClick={HandleAdd} />
                </Container>
            </Container>
        </Popup>
    )
}

export default EditLog