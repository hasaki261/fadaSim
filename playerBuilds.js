const getDisks = require('./getDisks.js')
const { rollup } = require("d3-array")

module.exports = ({p, N, slotsConfig}) => {
    const maxBuildsRolls = []
    for (let o = 0; o < p ; o++) {
        const slotsRolls = []
        for (let i = 0; i < slotsConfig.length; i++) {
            const disksMult = slotsConfig[i].disksMult
            const goodPools = slotsConfig[i].goodPools
            const blockedSub = slotsConfig[i].blockedSub
            const n = Math.floor(N * disksMult)
            const slotDisks = []
            slotDisks.push(...getDisks({n, goodPools, blockedSub}))
            let best = slotDisks[0]
            for (const disk of slotDisks) {
                if (disk.goodRolls > best.goodRolls) {best = disk}
            }
            const slotMaxRolls = best.goodRolls
            slotsRolls.push(slotMaxRolls)
        }
        const playerMaxRolls = slotsRolls.reduce((acc, slotRolls) => acc + slotRolls, 0)
        maxBuildsRolls.push(playerMaxRolls)
    }
    return maxBuildsRolls
}