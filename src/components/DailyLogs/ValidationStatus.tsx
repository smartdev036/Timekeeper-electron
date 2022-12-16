import clsx from "clsx"
import { FaCheck, FaTimes } from "react-icons/fa"
import styles from "./ValidationStatus.module.scss"

interface ValidationStatusProps {
    checked: boolean
    label?: string
}

const ValidationStatus = (props: ValidationStatusProps) => {
    const label = props.label ?? (props.checked ? "Logs Validated" : "Not Validated")
    return (
        <div
        className={clsx(
            styles.validationStatus,
            props.checked ? styles.check : styles.cross,
        )}
        >
            {props.checked ? <FaCheck/> : <FaTimes/>}
            <span>{label}</span>
        </div>
    )
}

export default ValidationStatus