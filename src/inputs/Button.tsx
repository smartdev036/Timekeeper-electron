import clsx from "clsx"
import React from "react"
import { IconType } from "react-icons"
import { Link } from "react-router-dom"
import styles from "./Button.module.scss"

interface ButtonProps {
    label: string
    push?: "right"
    onClick?: React.MouseEventHandler<HTMLButtonElement>
    disabled?: boolean
    hidden?: boolean
    size?: "normal" | "small" | "large"
    width?: "fit-content" | "100%"
    margin?: [number, number]
    to?: string
    className?: string
    icon?: IconType
}

const Button = React.forwardRef(({
    label,
    push,
    size = "normal",
    width = "fit-content",
    onClick,
    disabled,
    hidden,
    className,
    icon: Icon,
    to,
    ...__props
}: ButtonProps, ref) => {
    const props = {...__props}
    if (typeof to !== "undefined") {
        (props as any).to = to
    }

    const style = typeof props.margin !== "undefined" ? {
        marginTop: props.margin[0],
        marginBottom: props.margin[1]
    } : {}

    const Component = typeof to === "undefined" ? "button" : Link

    return (
        <Component
        ref={ref as any}
        className={clsx(
            styles.Button,
            push === "right" && styles.pushRight,
            styles[size],
            width === "100%" && styles.fullWidth,
            disabled && styles.disabled,
            hidden && styles.hidden,
            className ?? ""
        )}
        //@ts-ignore
        onClick={onClick}
        style={style}
        {...props}
        >
            {Icon && <Icon className={styles.Icon} />}{label}
        </Component>
    )
})

export default Button