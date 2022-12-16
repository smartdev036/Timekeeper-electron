// preload with contextIsolation enabled
import { contextBridge } from "electron"
import exec from "./helpers/exec"

contextBridge.exposeInMainWorld('Backend', {
    ipcRenderer: require('electron').ipcRenderer
})
