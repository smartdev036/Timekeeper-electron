import { MinDigits } from "./functions";

const MONTH = {
    0: "Jan",
    1: "Feb",
    2: "Mar",
    3: "April",
    4: "May",
    5: "June",
    6: "July",
    7: "Aug",
    8: "Sep",
    9: "August",
    10: "Nov",
    11: "Dec",
}

interface UTCDateProps {
    year: number
    month: number
    date: number
}

class UTCDate {
    readonly year: number
    readonly month: number
    readonly date: number

    constructor(props?: UTCDateProps) {
        const dt = new Date()
        ;[this.year, this.month, this.date] = typeof props !== "undefined" ? [
            props.year,
            props.month,
            props.date
        ] : [
            dt.getUTCFullYear(),
            dt.getUTCMonth(),
            dt.getUTCDate()
        ]
    }

    UNIX() {
        const dt = new Date()
        dt.setUTCFullYear(this.year, this.month, this.date)
        dt.setUTCHours(0, 0, 0)
        return dt.getTime()
    }

    gte(date: UTCDate) {
        return this.UNIX() >= date.UNIX()
    }
    
    lte(date: UTCDate) {
        return this.UNIX() <= date.UNIX()
    }

    range(to_date: UTCDate) {
        const [start, end] = [this.toNormalDate(), to_date.toNormalDate()]
        const arr = []
        for (
            const dt = new Date(start);
            dt <= end;
            dt.setDate(dt.getDate()+1)
        ){
            arr.push(UTCDate.fromNormalDate(dt));
        }
        return arr;

    }

    static fromSerialized(serialized_date: string) {
        const [year, month, date] = serialized_date.split("-")
        return new UTCDate({
            year: parseInt(year),
            month: parseInt(month)-1,
            date: parseInt(date)
        })        
    }

    toSerialized() {
        const [year, month, date] = [
            MinDigits(4, this.year),
            MinDigits(2, this.month + 1),
            MinDigits(2, this.date),
        ]

        return `${year}-${month}-${date}`
    }

    static fromNormalDate(dt: Date) {
        return new UTCDate({
            year: dt.getFullYear(),
            month: dt.getMonth(),
            date: dt.getDate(),
        })
    }

    toNormalDate() {
        const dt = new Date()
        dt.setFullYear(this.year, this.month, this.date)
        dt.setHours(0, 0, 0)
        return dt
    }

    getMonthName() {
        return (MONTH as any)[this.month]
    }
}

export default UTCDate