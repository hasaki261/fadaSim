const getDisks = require('./getDisks.js')
const { rollup } = require("d3-array")

module.exports = ({ p, n, goodPools, blockedSub, preDist}) => {
    const staticsArray = []
    for (let o = 0; o < p ; o++) {
        const playerDisks = []
        playerDisks.push(...getDisks({n, goodPools, blockedSub, preDist}))
        const playerStatics = {}
        const rollsCount = rollup(playerDisks, v => v.length, d => d.goodRolls)
        for (let k = 0; k < (goodPools.length + 6); k++) {
        // gP.length is the total of base Rolls you can get, and +6 is max upgrades (+5) and +1 for the looping
            if (rollsCount.get(k)) playerStatics[`has-${k}`] = true
            else playerStatics[`has-${k}`] = false
        }
        staticsArray.push(playerStatics)
    }
    return staticsArray
}