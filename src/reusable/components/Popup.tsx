import React, { Fragment, useState } from "react"
import Modal from '@mui/material/Modal';
import styles from "./Popup.module.scss"
import Container from "./Container";

interface PopupProps {
    trigger: React.ReactElement
    children: React.ReactNode
    state?: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
}

const Popup = ({trigger, children, state}: PopupProps) => {
    const selfManaged = useState(false)
    const [open, setOpen] = state ?? selfManaged
    return (
        <Fragment>
            <span className={styles.placeholder} onClick={() => setOpen(true)}>{trigger}</span>
            <Modal open={open} onClose={() => setOpen(false)}>
                <Container className={styles.ModalInner}>
                    {children}
                </Container>
            </Modal>
        </Fragment>
    )
}

export default Popup