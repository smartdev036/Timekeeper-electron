import clsx from "clsx";
import DB from "../../DB";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"
import { fromSerializedTime, MinDigits } from "../../reusable/functions";
import useAsyncRefresh from "../../reusable/hooks/useAsyncRefresh";
import { ReportTypes } from "../../db-typings/electron/Models/LogTimes";
import useReRender from "../../reusable/hooks/useReRender";
import Button from "../../inputs/Button";
import styles from "./ReportTable.module.scss"
import { IoMdPrint } from "react-icons/io";
import LocalDate from "../../reusable/LocalDate";

interface ReportTableProps {
    start_date: LocalDate
    end_date: LocalDate
    report_type: ReportTypes
}

export const PrintReportButton = (props: ReportTableProps) => {

    return (
        <Button
        icon={IoMdPrint}
        label="Print Report"
        className={styles.PrintButton}
        onClick={() => {
            const date = `${props.start_date.toSerialized().replaceAll("-", "/")} - ${props.end_date.toSerialized().replaceAll("-", "/")}`
            const filename = `${props.report_type === "protime" ? "Protime" : "Trainer"} Report ${date}`

            const divToPrint = document.getElementById("report-table");
            if (divToPrint === null) return
            const iframeWrapper = document.createElement("div")
            // iframeWrapper.style.display = "none"
            const iframe = document.createElement("iframe")
            iframeWrapper.appendChild(iframe)
            window.document.documentElement.appendChild(iframeWrapper)

            iframe.contentWindow?.document.write(`<div class=${styles.PrintHeading}>${filename}</div>`)
            iframe.contentWindow?.document.write(divToPrint.outerHTML);
            iframe.contentWindow?.document.getElementById("report-table")?.classList.add(styles.Print)

            ;[...document.querySelectorAll("style, link[rel='stylesheet']")].forEach(el => {
                if (el.tagName.toLowerCase() === "style") {
                    const style = el.cloneNode() as HTMLStyleElement
                    for (const rule of ((el as HTMLStyleElement).sheet?.cssRules ?? []) ) {
                        style.textContent += rule.cssText
                    }
                    iframe.contentWindow?.document.head.appendChild(style)
                } else if (el.tagName.toLowerCase() === "link") {
                    iframe.contentWindow?.document.head.appendChild(el.cloneNode(true))
                }
            })

            iframe.contentWindow && (iframe.contentWindow.document.title = filename);

            setTimeout(() => {
                const prevTitle = window.document.title
                window.document.title = filename
                
                iframe.contentWindow?.print()

                window.document.title = prevTitle
                iframeWrapper.remove()
            }, 500)
        }}
        />
    )
}

const ReportTable = (props: ReportTableProps) => {
    const {counter} = useReRender()

    const {value: positions_value} = useAsyncRefresh(() => DB.Positions.GetAll(), [DB, counter])
    
    const {value: controller_value} = useAsyncRefresh(() => DB.Controller.GetAll(), [DB, counter])

    const {value: report_value} = useAsyncRefresh(
        () => DB.LogTimes.GetReport(
            props.report_type,
            props.start_date.toSerialized(),
            props.end_date.toSerialized()
        ),
        [DB, counter, props.report_type, props.start_date, props.end_date]
    )
    const reportMap: {
        [controller_id: number]: {
            [position_id: number]: number
        }
    } = {}
    report_value?.result.forEach(row => {
        reportMap[row.controller_id] = reportMap[row.controller_id] ?? {}
        reportMap[row.controller_id][row.position_id] = row.duration
    })

    return (
        <TableContainer component={Paper} className={styles.Container} id="report-table">
            <Table className={styles.Table} size="small" stickyHeader >
                <TableHead>
                    <TableRow>
                        <TableCell className={clsx(styles.Sticky, styles.TopLeft, styles.HeaderCell)}></TableCell>
                        {positions_value?.result.map(position => {
                            return (
                                <TableCell key={position.id} className={styles.HeaderCell} align="right">{position.shorthand}</TableCell>
                            )
                        })}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {controller_value?.result.map(controller => {
                        return (
                            <TableRow
                            key={controller.id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row" variant="head" className={clsx(styles.LeftHeaderCell, styles.Sticky)}>
                                    {controller.initials}
                                </TableCell>
                                {positions_value?.result.map(position => {
                                    const duration = fromSerializedTime(reportMap?.[controller.id]?.[position.id] ?? 0)
                                    const [hours, min] = [duration.getUTCHours(), duration.getUTCMinutes()]
                                    const time_took = `${hours}:${MinDigits(2, min)}`
                                    const totalMin = (hours * 60) + min
                                    return (
                                        <TableCell
                                        key={position.id}
                                        align="right"
                                        className={clsx(
                                            styles.InnerCell,
                                            totalMin >= position.proficiency_time_min ? styles.Valid : styles.Invalid
                                        )}>
                                            {time_took}
                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default ReportTable