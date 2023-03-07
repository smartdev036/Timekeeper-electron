import * as DBTypings from "./db-typings/electron/Models/index"

//@ts-ignore
const { ipcRenderer: ipc } = window.Backend

type Await<T> = T extends Promise<infer U> ? U : T
type StaticTypings = typeof DBTypings

type WrappedResult<T  extends (...args: any) => any> = {
    exists: boolean,
    call: string,
    result: Await<ReturnType<T>>
}
type WrappedFunction<T  extends (...args: any) => any> = (...parameters: Parameters<T>) => Promise<WrappedResult<T>>

type DBWrappedTyping = {
    [module in keyof StaticTypings]: {
        //@ts-ignore
        [method in keyof StaticTypings[module]]: WrappedFunction<StaticTypings[module][method]>
    }
}

const DB = new Proxy({}, {
    get: (_, module: string) => {
        return new Proxy({}, {
            get: (_, func: string) => {
                return (...args: any[]) => {
                    // console.log("call =>", `${module}.${func}`, args)
                    return ipc.invoke("call", `${module}.${func}`, ...args)
                }
            }
        })
    }    
}) as DBWrappedTyping

export const ElectronAlert = function(str: string) {
    ipc.send("alert", str);
}

export const ElectronConfirm = function(str: string) {
    let res = ipc.invoke("question", str)
    return res
}

export default DB