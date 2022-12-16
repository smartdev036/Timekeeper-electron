import { useState } from "react"
import StateSelect from "./StateSelect"

interface StateTimeSelectProps {
    label: string
    options?: number[]
    defaultValue?: number
    state?: [number, React.Dispatch<React.SetStateAction<number>>]

}

const StateTimeSelect = (props: StateTimeSelectProps) => {
    const selfManaged = useState<number>(props.defaultValue ?? 60)
    const state = props.state ?? selfManaged

    const {options = [90, 60, 45, 30, 15]} = props

    return (
        <StateSelect
        options={options.map(value => ({
            label: `${value} Minutes`,
            value
        }))}
        label={props.label}
        state={state}
        defaultValue={props.defaultValue ?? 60}
        />
    )
}

export default StateTimeSelect