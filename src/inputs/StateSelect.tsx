import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material"
import clsx from "clsx"
import { useState } from "react"
import styles from "./StateSelect.module.scss"

type OptionTypes = string | number

interface StateSelectProps<T extends OptionTypes> {
    label: string
    options: {
        label: string
        value: T
    }[]
    state?: [T, React.Dispatch<React.SetStateAction<T>>]
    defaultValue?: T
    width?: "100%" | "fit-content"
}

const StateSelect = <T extends OptionTypes>(props: StateSelectProps<T>) => {
    const selfManaged = useState<T>(props.defaultValue ?? props.options[0].value)
    const state = props.state ?? selfManaged

    const onChange = (event: SelectChangeEvent<T>) => {
        state[1](event.target.value as T)
    }

    return (
        <FormControl>
            <InputLabel>{props.label}</InputLabel>
            <Select
            label={props.label}
            value={state[0]}
            onChange={onChange}
            className={clsx(props.width === "fit-content" && styles.fitContent)}
            >
                {props.options.map(option => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}

export default StateSelect