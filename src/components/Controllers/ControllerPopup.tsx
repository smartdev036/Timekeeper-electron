import { useRef, useState } from "react"
import DB from "../../DB"
import { Controller } from "../../db-typings/electron/Models"
import Button from "../../inputs/Button"
import StateTextInput from "../../inputs/StateTextInput"
import Popup from "../../reusable/components/Popup"
import { isEmpty } from "../../reusable/functions"
import useReRender from "../../reusable/hooks/useReRender"
import AsyncErrorCatcher from "../../reusable/utils/AsyncErrorCatcher"
import ManageCrew from "./ManageCrew"


interface ControllerPopupProps {
    trigger: React.ReactElement
    controller: null | (Controller & {
        crew_id: string | null;
        crew_name: string | null;
    })
}

interface OptionType {
    label: string
    id: number
}

const ControllerPopup = (props: ControllerPopupProps) => {
    const {ReRender} = useReRender()
    
    const State = {
        first_name: useState(props.controller?.first_name ?? ""),
        last_name: useState(props.controller?.last_name ?? ""),
        initials: useState(props.controller?.initials ?? ""),
    }
    const crewRef = useRef<OptionType | null>((props.controller === null || isEmpty(props.controller.crew_name ?? "")) ? null : {
        label: props.controller.crew_name ?? "",
        id: parseInt(props.controller.crew_id ?? "0")
    })

    const HandleSave = AsyncErrorCatcher(async () => {
        const ControllerFields = Object.fromEntries(Object.keys(State).map(key => [key, (State as any)[key][0] ])) as Controller
        if (isEmpty(ControllerFields.first_name, ControllerFields.last_name, ControllerFields.initials)) {
            return
        }
        let id = props.controller?.id ?? 0
        try {
            if (props.controller === null) {
                id = (await DB.Controller.Insert(Object.assign(ControllerFields, {id: 0}) as Controller)).result
            } else {
                await DB.Controller.Update(Object.assign(ControllerFields, {id: props.controller.id}) as Controller)
            }                
        } catch (error) {
            if ((error as Error).toString().includes("UNIQUE constraint failed: controllers.initials")) {
                State.initials[1]("")
                return setTimeout(() => alert("Initials must be unique."))
            }
            throw error
        }

        if (crewRef.current !== null) {
            let crew_id = crewRef.current.id
            if (crewRef.current.id === 0) {
                crew_id = (await DB.Crew.Insert({
                    id: 0,
                    name: crewRef.current.label
                })).result
            }

            await DB.Controller.UpdateCrew(id, crew_id)
        }

        if (props.controller === null) {
            Object.keys(State).forEach(key => (State as any)[key][1](""))
            crewRef.current = null    
        }

        setOpen(false)
        ReRender()
    })

    const [open, setOpen] = useState(false)

    return (
        <Popup trigger={props.trigger} state={[open, setOpen]} >
            <StateTextInput label="First Name" state={State.first_name} required />
            <StateTextInput label="Last Name" state={State.last_name} required />
            <StateTextInput label="Initials" state={State.initials} required />
            <ManageCrew valueRef={crewRef} />
            <Button
            label={props.controller ? "Save" : "Add"}
            push="right"
            onClick={HandleSave}
            />
        </Popup>
    )
}

export default ControllerPopup