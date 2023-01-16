import ValidationStatus from "./ValidationStatus"
import styles from "./AllDailyValidated.module.scss"
import clsx from "clsx"
import { Link } from "react-router-dom"
import useAsyncRefresh from "../../reusable/hooks/useAsyncRefresh"
import DB, { ElectronAlert } from "../../DB"
import useReRender from "../../reusable/hooks/useReRender"
import LocalDate from "../../reusable/LocalDate"
import { useEffect } from "react"
import { useLocation } from "react-router-dom"

const AllDailyValidated = () => {
    const { counter } = useReRender()

    const location = useLocation()

    const { value: logs_value } = useAsyncRefresh(
        () => DB.LogValidation.UnValidated(new LocalDate().toSerialized()),
        [DB, counter]
    )

    const { value: positions_value } = useAsyncRefresh(() => DB.Positions.GetAll(), [counter])

    const { value: position_logs } = useAsyncRefresh(
        async () => {
            let items: any = positions_value?.result?.map(async (position: any) =>
            (
                {
                    position: position,
                    logtimes: await DB.LogTimes.GetAllLogs(position.id, (new LocalDate().toSerialized()))
                }
            ))
            return await Promise.all(items)
        }
        , [positions_value])

    const checked = logs_value?.result === 0

    const handleSaveFile = async () => {
        if (!!position_logs) {
            let res = await DB.LogTimes.SaveDailyLog(position_logs, new LocalDate().toSerialized())
            if (res.result.success === true) {
                ElectronAlert(res.result.msg + '.csv saved Successfully!')
            } else {
                ElectronAlert(res.result.msg + '.csv failed, please try again!')
            }
        }
    }

    return (
        <>
            {
                location.pathname === '/daily-logs' && checked &&
                <span className={styles.saveasfile} onClick={handleSaveFile}>Save as file</span>
            }
            <Link
                to="/daily-logs"
                className={clsx(styles.Container, checked ? styles.check : styles.cross)}
            >
                <ValidationStatus checked={checked} label="Logs Validated" />
            </Link>
        </>
    )
}

export default AllDailyValidated