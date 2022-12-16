import { MinDigits } from "./functions";
import UTCDate from "./UTCDate";

interface UTCTimeProps {
    hour: number
    minute: number
    second: number
}

class UTCTime {
    readonly hour: number
    readonly minute: number
    readonly second: number

    constructor(props?: UTCTimeProps) {
        const dt = new Date()
        ;[this.hour, this.minute, this.second] = typeof props !== "undefined" ? [
            props.hour,
            props.minute,
            props.second
        ] : [
            dt.getUTCHours(),
            dt.getUTCMinutes(),
            dt.getUTCSeconds()
        ]
    }

    static fromSerialized(serialized_time: number) {
        const [TotalMinutes, seconds]  = [Math.floor(serialized_time / 60), Math.floor(serialized_time % 60)]
        const [hours, minutes]  = [Math.floor(TotalMinutes / 60), Math.floor(TotalMinutes % 60)]
    
        return new UTCTime({
            hour: hours,
            minute: minutes,
            second: seconds
        })
    
    }

    toSerialized() {
        const TotalSeconds = (this.hour * 60 * 60) + (this.minute * 60) + (this.second)
    
        return TotalSeconds
    }

    formatToZ() {
        const withZ = true
        return `${MinDigits(2, this.hour)}${MinDigits(2, this.minute)}${withZ ? " Z" : ""}`
    }

    mergeDate(date: UTCDate) {
        const d = new Date()
        d.setUTCFullYear(date.year, date.month, date.date)
        d.setUTCHours(this.hour, this.minute, this.second)

        return d
    }
}

export default UTCTime
