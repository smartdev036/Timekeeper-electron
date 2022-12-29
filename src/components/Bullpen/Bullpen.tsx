import { Autocomplete, TextField } from "@mui/material"
import { Fragment, useRef } from "react"
import DB from "../../DB"
import Button from "../../inputs/Button"
import Container from "../../reusable/components/Container"
import Heading from "../../reusable/components/Heading"
import Popup from "../../reusable/components/Popup"
import { clone } from "../../reusable/functions"
import useAsyncRefresh from "../../reusable/hooks/useAsyncRefresh"
import useReRender from "../../reusable/hooks/useReRender"
import LocalDate from "../../reusable/LocalDate"
import styles from "./Bullpen.module.scss"

interface OptionType {
    type: "Controller" | "Crew"
    label: string
    id: number
}

const AddBullpenPopup = () => {
    const {ReRender, counter} = useReRender()

    const {value: controller_value} = useAsyncRefresh(() => DB.Controller.GetAll(), [DB, counter])
    const {value: crew_value} = useAsyncRefresh(() => DB.Crew.GetAll(), [DB, counter])
    
    const controllers: OptionType[] = controller_value?.result.map(controller => ({
        type: "Controller",
        label: `${controller.initials} - ${controller.first_name} ${controller.last_name}`,
        id: controller.id
    })) ?? []
    const crew: OptionType[] = crew_value?.result.map(crew => ({
        type: "Crew",
        label: crew.name,
        id: crew.id
    })) ?? []

    const ref = useRef<OptionType | null>(null)

    const HandleAdd = async () => {
        if (ref.current === null) return
        if (ref.current.type === "Controller") {
            await DB.Bullpen.AddWithActiveTest(ref.current.id)
        } else {
            await DB.Bullpen.AddCrew(ref.current.id)
        }
        ReRender()
    }

    return (
        <Popup trigger={<Button label="Add" />} >
            <Heading level="h3" label="Add to Bullpen" margin={[0, 15]} />
            <Autocomplete
            disablePortal
            options={crew.concat(controllers)}
            groupBy={(option) => option.type}
            renderInput={(params) => <TextField {...params} label="Individuals/Crew" />}
            onChange={(_, newValue) => ref.current = clone(newValue)}
            isOptionEqualToValue={(option, value) => JSON.stringify(option) === JSON.stringify(value)}
            />
            <Button label="Add" push="right" onClick={HandleAdd} />
        </Popup>
    )
}

const Bullpen = () => {
    const {ReRender, counter} = useReRender()
    let date = LocalDate.fromNormalDate(new Date())
    
    const {value: bullpen_value} = useAsyncRefresh(() => DB.Bullpen.GetAll(null), [DB, counter])
    const getTime = (initialTime: string): string => {
        let now = new Date().getTime();
        let milisec_diff = now - Number(initialTime);
        let minutes =  Math.round(((milisec_diff % 86400000) % 3600000) / 60000); 
        let hours = Math.floor(milisec_diff / 1000 / 60 / 60)
        return ' -  Last in ' +hours+'h  '+minutes +'m' + ' ago'
    }
    return (
        <Fragment>
            <Heading level="h2" label="Bullpen" center={true} margin={[10, 10]} />
            <Container className={styles.Inner} noMargin={true}>
                {bullpen_value?.result.map(bullpen => (
                    <Container dir="row" key={bullpen.id}>
                        <div> {bullpen.initials} - {bullpen.first_name} {bullpen.last_name}
                        {Number(bullpen.time_since_lastin) ?  <span>{getTime(bullpen.time_since_lastin)}</span> : <></>}
                        
                        </div>
                        <Container push="right" width="fit-content" dir="row" className={styles.ActionButtons} >
                            <Button label="Remove" onClick={async () => {
                                await DB.Bullpen.Delete(bullpen.id)
                                ReRender()
                            }} />
                        </Container>
                    </Container>
                ))}
            </Container>
            <Container dir="row" className={styles.Buttons} width="fit-content" push="right">
                <AddBullpenPopup />
            </Container>
        </Fragment>
    )
}

export default Bullpen