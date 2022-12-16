import clsx from "clsx"
import styles from "./Heading.module.scss"

interface HeadingProps {
    level: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
    label: string
    center?: boolean
    margin?: [number, number]
}

const Heading = (props: HeadingProps) => {
    const Component = props.level
    const style = typeof props.margin !== "undefined" ? {
        marginTop: props.margin[0],
        marginBottom: props.margin[1]
    } : {}

    return (
        <Component
        className={clsx(props.center && styles.center)}
        style={style}
        >
            {props.label}
        </Component>
    )
}

export default Heading