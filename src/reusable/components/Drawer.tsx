import React, { Fragment } from "react"
import styles from "./Drawer.module.scss"
import Container from "./Container";
import { Popover } from "@mui/material";
import clsx from "clsx";

interface DrawerProps {
    trigger: React.ReactElement
    children: React.ReactNode
}

const Drawer = ({trigger, children}: DrawerProps) => {
    const [anchorEl, setAnchorEl] = React.useState<HTMLSpanElement | null>(null);

    const Actions = {
        Open: (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => setAnchorEl(event.currentTarget),
        // Close: (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => setAnchorEl(event.currentTarget),
        Close: () => setAnchorEl(null)
    }

    return (
        <Fragment>
            <span
            className={clsx(styles.bottomRight)}
            onClick={event => setAnchorEl(event.currentTarget)}
            onMouseEnter={Actions.Open}
            onMouseLeave={Actions.Close}
            >{trigger}</span>
            <Popover
            onMouseEnter={Actions.Open}
            onMouseLeave={Actions.Close}
            open={!!anchorEl}
            anchorEl={anchorEl}
            disableScrollLock={true}
            onClose={Actions.Close}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            >
                <Container className={styles.DrawerInner}>
                    {children}
                </Container>
            </Popover>
        </Fragment>
    )
}

export default Drawer