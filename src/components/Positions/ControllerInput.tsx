import { Autocomplete, TextField } from "@mui/material"
import { useEffect, useState } from "react"
import DB from "../../DB"
import { clone, isEmpty } from "../../reusable/functions"
import useAsyncRefresh from "../../reusable/hooks/useAsyncRefresh"
import useReRender from "../../reusable/hooks/useReRender"
import LocalDate from "../../reusable/LocalDate"

interface OptionType {
    label: string
    id: number
}

interface ControllerInputProps {
    label: string
    state?: [OptionType | null, React.Dispatch<React.SetStateAction<OptionType | null>>]
    required?: boolean
    exclude?: number[]
    include?: number[]
    until?: {
        date: string
        time?: number
    }
}

const ControllerInput = (props: ControllerInputProps) => {
    const {ReRender, counter} = useReRender()

    const until = props.until ?? {
        date: new LocalDate().toSerialized(),
        time: undefined
    }

    const {value: status} = useAsyncRefresh(() => {
        return DB.LogTimes.GetAllPositionsStatus(until.date, until.time)
    })
    const busy_controllers = (status?.result ?? []).map(row => [row.controller_id, row.trainee_controller_id]).flat()

    const {value: controller_value} = useAsyncRefresh(() => DB.Controller.GetAll(), [DB, counter])
    const controllers: OptionType[] = (controller_value?.result.map(controller => ({
        label: `${controller.initials} - ${controller.first_name} ${controller.last_name}`,
        id: controller.id
    })) ?? []).filter(controller => {
        const isExcluded = (props.exclude ?? []).includes(controller.id)
        if (isExcluded) {
            return false
        }

        const isIncluded = (props.include ?? []).includes(controller.id)
        if (isIncluded) {
            return true
        }

        const isUnavailable = busy_controllers.includes(controller.id)
        return !isUnavailable
    })

    const IsInvalidState = useState(false)
    const {required = false} = props

    const EvalulateState = (value: OptionType | null) => {
        if (value === null) {
            return IsInvalidState[1](true)
        } else {
            return IsInvalidState[1](false)
        }
    }

    const selfManaged = useState<OptionType | null>(null)
    const state = props.state ?? selfManaged

    useEffect(() => {
        EvalulateState(state[0])
    }, [])

    return (
        <Autocomplete
        disablePortal
        options={controllers}
        renderInput={(params) => (
            <TextField
            {...params}
            required={required}
            error={required && IsInvalidState[0]}
            label={props.label} />
        )}
        value={clone(state[0])}
        onChange={(_, newValue) => {
            state[1](clone(newValue))
            EvalulateState(newValue)
        }}
        isOptionEqualToValue={(option, value) => JSON.stringify(option) === JSON.stringify(value)}
        />
    )
}

export default ControllerInput