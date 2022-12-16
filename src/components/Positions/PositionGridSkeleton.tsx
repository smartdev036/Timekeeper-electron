import clsx from "clsx"
import styles from "./PositionGridSkeleton.module.scss"

interface PositionGridSkeletonProps {
    children: React.ReactNode
    className?: string
}

const PositionGridSkeleton = ({children, className}: PositionGridSkeletonProps) => {
    return (
        <div className={clsx(styles.Container, className)}>{children}</div>
    )
}

export default PositionGridSkeleton