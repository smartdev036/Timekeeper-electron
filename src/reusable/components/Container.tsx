import React from "react";
import styles from "./Container.module.scss";
import clsx from "clsx";

interface ContainerProps {
    dir?: "row" | "col"
    width?: number|string
    children?: React.ReactNode
    className?: string
    extend?: boolean
    push?: "right" | "bottom" | null
    noMargin?: boolean
}

const Container = React.forwardRef(({
    dir = "col",
    width = "100%",
    children = [],
    className = "",
    extend = false,
    push = null,
    noMargin = false,
    ...props
}: ContainerProps = {}, ref) => (
    <div
    ref={ref as any}
    style={{width}}
    {...props}
    className={clsx(
        styles.container,
        styles[dir],
        className,
        extend && styles.extend,
        noMargin && styles.noMargin,
        push === "right" && styles.pushRight,
        push === "bottom" && styles.pushBottom,
    )}
    >
        {children}
    </div>
))
export default Container;