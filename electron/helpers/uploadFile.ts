import fetch from "cross-fetch"
import * as fs from "fs"

const uploadFile = async (url: string, path: string) => {
    const readStream = fs.createReadStream(path);

    const response = await fetch(url, {
        method: "PUT",
        body: readStream as any // Here, stringContent or bufferContent would also work
    })

    return await response.text()
}

export default uploadFile