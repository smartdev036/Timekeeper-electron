export const newNativeTimeAsUTC = () => {
    const now = new Date()
    const d = new Date()
    d.setFullYear(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    d.setHours(now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds())
    return d
    
}