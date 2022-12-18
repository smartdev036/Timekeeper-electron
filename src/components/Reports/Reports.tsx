import StateSelect from "../../inputs/StateSelect"
import Container from "../../reusable/components/Container"
import styles from "./Reports.module.scss"
// import DateRangePicker, { DateRange } from '@mui/lab/DateRangePicker';
import { DateRangePicker, DateRange } from '@mui/x-date-pickers-pro/DateRangePicker';

import { Fragment, useEffect, useState } from "react";
import { Box, TextField } from "@mui/material";
import ReportTable, { PrintReportButton } from "./ReportTable";
import { ReportTypes } from "../../db-typings/electron/Models/LogTimes";
import DB from "../../DB";
import { useNavigate } from "react-router-dom";
import LocalDate from "../../reusable/LocalDate";

const Reports = () => {
    const [dateRange, setDateRange] = useState<DateRange<LocalDate>>([null, null]);
    const [start_date, end_date] = dateRange
    const reportTypeState = useState<ReportTypes>("protime");

    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            const [start, end] = dateRange
            if (start === null || end === null) return
            const {result} = await DB.LogValidation.ValidationCalendar(start.toSerialized(), end.toSerialized())
            const unvalidated_dates = Object.entries(result).filter(([date, unvalidated]) => unvalidated > 0).map(([date]) => date)    
            if (unvalidated_dates.length > 0) {
                const warnings = unvalidated_dates.map(serialized_date => {
                    const date = LocalDate.fromSerialized(serialized_date)
                    return `${date.getMonthName()} ${date.date} is unvalidated.`
                })
                window.alert(warnings.join("\n"))
                navigate("/daily-logs")
            }
        })()
    }, [dateRange])

    return (
        <Fragment>
            <Container className={styles.Container} dir="row">
                <StateSelect
                state={reportTypeState}
                label="Report Type"
                options={[{
                    label: "Protime",
                    value: "protime"
                }, {
                    label: "Trainer",
                    value: "trainer"
                }]}
                width="fit-content"
                />
                <Container width="fit-content" dir="row" push="right">
                    {(start_date && end_date) && (
                        <PrintReportButton
                        start_date={start_date}
                        end_date={end_date}
                        report_type={reportTypeState[0]}
                        />
                    )}
                    <DateRangePicker
                    shouldDisableDate={(day: any)=> {
                        if (day === null) {
                            return false
                        }
                        const open = LocalDate.fromNormalDate(day).lte(new LocalDate())
                        return !open
                    }}
                    startText="Start"
                    endText="End"
                    value={[dateRange[0]?.toNormalDate() ?? null, dateRange[1]?.toNormalDate() ?? null] as DateRange<Date>}
                    onChange={async (newValue:any) => {
                        const start = newValue[0] ? LocalDate.fromNormalDate(newValue[0]) : null
                        const end = newValue[1] ? LocalDate.fromNormalDate(newValue[1]) : null
                        setDateRange([start, end] as DateRange<LocalDate>)
                    }}
                    renderInput={(startProps:any, endProps:any) => {
                        return (
                            <Fragment>
                                <TextField {...startProps} />
                                <Box sx={{ mx: 2 }}> to </Box>
                                <TextField {...endProps} />
                            </Fragment>
                        );
                    }}
                    />
                </Container>
            </Container>
            {(start_date && end_date) ? (
                <ReportTable
                start_date={start_date}
                end_date={end_date}
                report_type={reportTypeState[0]}
                />
            ) : (
                <div className={styles.NoDateMessage}>
                    <h2>Select Start and End dates for the report.</h2>
                </div>
            )}
        </Fragment>
    )
}

export default Reports