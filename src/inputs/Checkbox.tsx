import { Checkbox, FormControlLabel } from "@mui/material"
import { useState } from "react"

interface StateCheckboxProps {
    label: string
    state?: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
}

const StateCheckbox = (props: StateCheckboxProps) => {
    const selfManaged = useState(false)
    const state = props.state ?? selfManaged
    
    return (
        <FormControlLabel
        style={{margin: 0, transform: "translateX(-6px)"}}
        label={props.label}
        control={
            <Checkbox
            checked={state[0]}
            onChange={(event) => state[1](event.target.checked)}
            />
        }
        />
    )
}

export default StateCheckbox