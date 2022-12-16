import ValidationStatus from "./ValidationStatus"
import styles from "./AllDailyValidated.module.scss"
import clsx from "clsx"
import { Link } from "react-router-dom"
import useAsyncRefresh from "../../reusable/hooks/useAsyncRefresh"
import DB from "../../DB"
import useReRender from "../../reusable/hooks/useReRender"
import LocalDate from "../../reusable/LocalDate"

const AllDailyValidated = () => {
    const {counter} = useReRender()

    const {value: logs_value} = useAsyncRefresh(
        () => DB.LogValidation.UnValidated(new LocalDate().toSerialized()),
        [DB, counter]
    )

    const checked = logs_value?.result === 0
    
    return (
        <Link
        to="/daily-logs"
        className={clsx(styles.Container, checked ? styles.check : styles.cross)}
        >
            <ValidationStatus checked={checked} label="Logs Validated" />
        </Link>
    )
}

export default AllDailyValidated