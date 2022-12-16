import { Fragment, useState } from "react"
import Button from "../../inputs/Button"
import Container from "../../reusable/components/Container"
import useAsyncRefresh from "../../reusable/hooks/useAsyncRefresh"
import styles from "./Controllers.module.scss"
import DB from "../../DB"
import ControllerPopup from "./ControllerPopup"
import Heading from "../../reusable/components/Heading"
import useReRender from "../../reusable/hooks/useReRender"

const Controllers = () => {
    const {ReRender, counter} = useReRender()

    const {value} = useAsyncRefresh(() => DB.Controller.GetAll(), [DB, counter])
    
    return (
        <Fragment>
            <Heading label="Controllers" margin={[10, 10]} level={"h2"} center={true} />
            <Container className={styles.Inner} noMargin={true}>
                {value?.result.map(controller => (
                    <Container dir="row" key={controller.id}>
                        <div>{controller.initials} - {controller.first_name} {controller.last_name}</div>
                        <Container push="right" width="fit-content" dir="row" className={styles.ActionButtons} >
                            <Button label="Remove" onClick={async () => {
                                await DB.Controller.Delete(controller.id)
                                ReRender()
                            }} />
                            <ControllerPopup trigger={<Button label="Edit" />} controller={controller}  />
                        </Container>
                    </Container>
                ))}
            </Container>
            <Container dir="row" className={styles.Buttons} width="fit-content" push="right">
                <ControllerPopup trigger={<Button label="Add" />} controller={null}  />
            </Container>
        </Fragment>
    )
}

export default Controllers