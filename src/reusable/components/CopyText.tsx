import clsx from "clsx"
import { useState } from "react"
import { FiCopy, FiCheck } from "react-icons/fi"
import copyToClipboard from "../utils/copyToClipboard"
import styles from "./CopyText.module.scss"

interface CopyTextProps {
    text: string
}

const CopyText = (props: CopyTextProps) => {
    const [copied, setCopied] = useState(false)
    return (
        <div
        className={clsx(styles.Container, copied && styles.Copied)}
        onClick={() => {
            copyToClipboard(props.text)
            setCopied(true)
            setTimeout(() => {
                setCopied(false)
            }, 3000)
        }}
        >
            <span>{props.text}</span>
            {copied ? <FiCheck className={styles.Icon}/> : <FiCopy className={styles.Icon}/>}
        </div>
    )
}

export default CopyText