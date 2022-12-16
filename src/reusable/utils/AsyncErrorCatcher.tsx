import copyToClipboard from "./copyToClipboard";

type BaseFunc = (...args: any[]) => Promise<any>

const AsyncErrorCatcher = <T extends BaseFunc>(caller: T) => {
    return (async (...args: any[]) => {
        try {
            return await caller(...args);
        } catch (_) {
            alert("An unknown error occured, details copied to clipboard.");
            const error = _ as Error
            
            await copyToClipboard(JSON.stringify({
                name: error.name,
                message: error.message,
                stack: error.stack
            }));
            return {AsyncErrorCatcherError: true}
        }
    }) as T
}

export default AsyncErrorCatcher