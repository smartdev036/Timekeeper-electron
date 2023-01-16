import { ipcMain, dialog } from "electron";
import * as Modules from "./Models"

type CallerMap = {
    [key: string]: Function
}

const CreateMap = (modules: any[]) => {
    const map: CallerMap = {}
    for (const module of modules) {
        const staticMethods = Object.keys(module).filter(member => typeof module[member] === "function")
        for (const method of staticMethods) {
            map[`${module.name}.${method}`] = module[method]
        }
    }
    return map
}

const ModulePickGenerator = (modules: any[]) => {
    const map = CreateMap(modules)
    return (call: string, args: any[]) => {
        return map[call]
    }
}

const ModulePicker = ModulePickGenerator(Object.values(Modules))

ipcMain.handle('call', async (event, call: string, ...args: any[]) => {
    const func = ModulePicker(call, args)
    return {
        exists: typeof func !== "undefined",
        call: call,
        result: typeof func === "undefined" ? undefined : await func(...args)
    }
})

ipcMain.on("alert",(event,message)=>{
    dialog.showMessageBox({
        type: 'info',
        message: message
    });
});


ipcMain.handle("question", async (event, message)=>{
    let res = await dialog.showMessageBox({
        type: 'question',
        message: message,
        buttons: ['OK', 'Cancel'],
    });
    if( res.response === 0) return true 
    else if (res.response === 1) return false
    return res
});
