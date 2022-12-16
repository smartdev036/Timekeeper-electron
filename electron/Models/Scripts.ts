import uploadFile from "../helpers/uploadFile"
import { SQLITE_PATH } from "./Core"
import settings from "../settings"

class Scripts {
    static async UploadDB() {
        const response = await uploadFile(settings.fileTransfer, SQLITE_PATH)
        return response
    }
}


export default Scripts