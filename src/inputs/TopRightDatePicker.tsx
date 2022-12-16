import { DatePicker, PickersDay, PickersDayProps } from "@mui/lab"
import { TextField } from "@mui/material"
import clsx from "clsx"
import { useState } from "react"
import useAsyncRefresh from "../reusable/hooks/useAsyncRefresh"
import useReRender from "../reusable/hooks/useReRender"
import LocalDate from "../reusable/LocalDate"
import styles from "./TopRightDatePicker.module.scss"

export type GetDayStatusFunc = (props: PickersDayProps<Date>) => Promise<"valid" | "invalid" | "">

interface TopRightDatePickerProps {
    label: string
    state?: [LocalDate, React.Dispatch<React.SetStateAction<LocalDate>>]
    GetDayStatus?: GetDayStatusFunc
}

const LogsPickerDay = (props: PickersDayProps<Date> & {
    GetDayStatus?: GetDayStatusFunc
}) => {
    const {counter} = useReRender()

    const {value: status = ""} = useAsyncRefresh(
        props.GetDayStatus ?? (async () => {}),
        [counter, props]
    )

    const open = LocalDate.fromNormalDate(props.day).lte(new LocalDate())

    return (
        <PickersDay
        {...props}
        disabled={!open}
        className={clsx(
            props.className,
            status === "valid" && styles.ValidDay,
            status === "invalid" && styles.InvalidDay,
        )}
        />
    )
}

const TopRightDatePicker = (props: TopRightDatePickerProps) => {
    const selfManaged = useState<LocalDate>(new LocalDate())
    const [date, setDate] = props.state ?? selfManaged

    return (
        <DatePicker
        label={props.label}
        value={date.toNormalDate()}
        onChange={(newValue:any) => newValue ? setDate(LocalDate.fromNormalDate(newValue)) : new LocalDate()}
        renderInput={(params:any) => (
            <TextField
            {...params}
            size="small"
            className={clsx(params.className, styles.DatePicker)}
            />
        )}
        renderDay={(day:any, selected:any, DayProps:any) => (
            <LogsPickerDay
            {...DayProps}
            GetDayStatus={props.GetDayStatus}
            />
        ) }
        shouldDisableDate={(day:any) => {
            const open = LocalDate.fromNormalDate(day).lte(new LocalDate())
            return !open
        }}
        />
    )
}

export default TopRightDatePicker