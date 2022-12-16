import TextField from "@mui/material/TextField"
import { useEffect, useState } from "react"
import { isEmpty } from "../reusable/functions"

interface StateTextInputProps {
    label: string
    state?: [string, React.Dispatch<React.SetStateAction<string>>]
    required?: boolean
    helper?: string
}

const StateTextInput = (props: StateTextInputProps) =>{
    const selfManaged = useState("")
    const state = props.state ?? selfManaged
    
    const IsInvalidState = useState(false)
    const {required = false} = props

    const EvalulateState = (value: string) => {
        if (isEmpty(value)) {
            return IsInvalidState[1](true)
        } else {
            return IsInvalidState[1](false)
        }
    }

    useEffect(() => {
        EvalulateState(state[0])
    }, [state])

    return (
        <TextField
        required={required}
        error={required && IsInvalidState[0]}
        label={props.label}
        variant="outlined"
        value={state[0]}
        onChange={event => state[1](event.target.value)}
        onInput={event => EvalulateState((event.target as HTMLInputElement).value)}
        onBlur={() => EvalulateState(state[0])}
        helperText={props.helper}
        />
    )
}

export default StateTextInput