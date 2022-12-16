import {exec as NodeExec} from "child_process"

interface ExecOptions {
    cwd?: string,
    test?: boolean
}

const exec = (cmds: string[], options?: ExecOptions) => {
    return new Promise<any>((resolve, reject) => {
        const fullcmd = cmds.join(" && ")

        if (options?.test) {
            const prefix_cwd = options.cwd && `cd ${options.cwd} &&`
            console.log(`${prefix_cwd} ${fullcmd}`)
        }
    
        const event = NodeExec(fullcmd, {
            cwd: options?.cwd
        })
        let returnText = ""
        event.stdout?.on("data", data => {
            returnText += data.toString()
            console.log('stdout: ' + data.toString());
        })
        event.stderr?.on('data', data => {
            console.log('stderr: ' + data.toString());
        });
    
        event.on('exit', code => {
            console.log('child process exited with code ' + code?.toString());
            resolve({code, returnText})
        });
    })
}

export default exec