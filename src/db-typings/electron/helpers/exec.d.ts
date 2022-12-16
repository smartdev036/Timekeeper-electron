interface ExecOptions {
    cwd?: string;
    test?: boolean;
}
declare const exec: (cmds: string[], options?: ExecOptions | undefined) => Promise<any>;
export default exec;
