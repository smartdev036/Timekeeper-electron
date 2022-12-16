import clsx from "clsx"
import styles from "./PositionBoxSkeleton.module.scss"

interface PositionBoxSkeletonProps {
    shorthand: string
    children?: React.ReactNode
    className?: string
    hidden?: boolean
    onClick?: (() => void) | (() => Promise<void>)
    hovered?: boolean
    onHover?: (hovered: boolean) => void
}

const PositionBoxSkeleton = (props: PositionBoxSkeletonProps) => {
    return (
        <div
        className={clsx(
            styles.Box,
            props.hidden && styles.hidden,
            props.hovered && styles.hovered,
            props.className
        )}
        onClick={props.onClick}
        onMouseEnter={!props.onHover ? undefined : (() => props.onHover && props.onHover(true))}
        onMouseLeave={!props.onHover ? undefined : (() => props.onHover && props.onHover(false))}
        >
            <div className={styles.Shorthand}>{props.shorthand}</div>
            {props.children}
        </div>

    )
}

export default PositionBoxSkeleton