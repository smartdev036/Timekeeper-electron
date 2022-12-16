import { Fragment, useState } from "react"
import DB from "../../DB"
import { LogValidation, Positions } from "../../db-typings/electron/Models"
import useAsyncRefresh from "../../reusable/hooks/useAsyncRefresh"
import useReRender from "../../reusable/hooks/useReRender"
import LocalDate from "../../reusable/LocalDate"
import ValidationPopup from "./ValidationPopup"
import TopRightDatePicker, { GetDayStatusFunc } from "../../inputs/TopRightDatePicker"
import PositionGridSkeleton from "../Positions/PositionGridSkeleton"


const DailyLogs = () => {
    const {counter} = useReRender()

    const [date, setDate] = useState<LocalDate>(new LocalDate())

    const {value: positions_value} = useAsyncRefresh(() => DB.Positions.GetAll(), [counter])
    const positionMap = Object.fromEntries(
        positions_value?.result
        .filter(position => date.gte(LocalDate.fromSerialized(position.created_date)) )
        .map(position => [position.position, position]) ?? []
    )

    const {value: validations_value} = useAsyncRefresh(
        () => DB.LogValidation.GetAllValidations(date.toSerialized()),
        [counter, date]
    )

    const validationMap = Object.fromEntries(
        validations_value?.result.map(validation => [validation.position_id, validation]) ?? []
    )

    const GetDayStatus: GetDayStatusFunc = async (props) => {
        if (props.disabled) {
            return "invalid"
        }
        const validations_value = await DB.LogValidation.UnValidated(LocalDate.fromNormalDate(props.day).toSerialized())
        const IsExcluded = props.selected || props.disabled
        const IsEmpty = !IsExcluded && (validations_value?.result ?? 0) > 0    

        return IsEmpty ? "invalid" : ""
    }

    return (
        <Fragment>
            <TopRightDatePicker
            label="Date"
            state={[date, setDate]}
            GetDayStatus={GetDayStatus}
            />
            <PositionGridSkeleton>
                {new Array(18).fill(null).map((_, i) => {
                    const position = positionMap[i] as Positions | undefined
                    const validation = validationMap[position?.id ?? 0] as LogValidation | undefined
                    return (
                        <ValidationPopup key={i} date={date} position={position} validated={!!validation} />
                    )
                })}
            </PositionGridSkeleton>
        </Fragment>
    )
}

export default DailyLogs