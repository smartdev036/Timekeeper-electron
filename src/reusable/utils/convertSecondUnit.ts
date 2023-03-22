export const convertSecondUnitByMinute = (second: number) => {
    let minutes = Math.floor(second / 60)
    return minutes * 60
}