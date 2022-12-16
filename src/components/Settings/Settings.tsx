import Button from "../../inputs/Button"
import { MdBackup } from "react-icons/md"
import DB from "../../DB"
import { useState } from "react"
import Popup from "../../reusable/components/Popup"
import CopyText from "../../reusable/components/CopyText"
import AsyncErrorCatcher from "../../reusable/utils/AsyncErrorCatcher"

const Settings = () => {
    const [uploading, setUploading] = useState(false)
    const [uploadLink, setUploadLink] = useState("")
    const PopupOpenState = useState(false)

    return (
        <>
            <Button
            disabled={uploading}
            label={uploading ? "Generating Link" : "Share Database"}
            margin={[40, 10]}
            size="large"
            icon={MdBackup}
            onClick={AsyncErrorCatcher(async () => {
                setUploading(true)
                try {
                    const result = await DB.Scripts.UploadDB()
                    setUploading(false)
                    setUploadLink(result.result)
                    PopupOpenState[1](true)    
                } catch (error) {
                    setUploading(false)
                    throw error
                }
            })}
            />
            <Popup trigger={ <div></div>} state={PopupOpenState}>
                <CopyText text={uploadLink} />
            </Popup>
        </>
    )
}
export default Settings