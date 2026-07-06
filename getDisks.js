const Chance = require("chance")
const chance = new Chance()
// const nameData = require('./subname.json')

module.exports = ({ n, goodPools, blockedSub}) => {
    const disks = []
    for (let j=0; j<n; j++) {
        // Mainstats Config
        const substatsPool = [31203, 12103, 12102, 21103, 20103, 13103, 13102, 11103, 11102, 23203]
        const substatsFixedPool = substatsPool.filter(subStat => subStat !== blockedSub)
        // Upgrades count
        const totalUps = chance.weighted([4, 5], [0.8, 0.2])
        // Subs choice
        const diskSubsDist = chance.unique(chance.integer, 4, {min: 0, max: substatsFixedPool.length - 1})
        const diskSubstats = []
        diskSubsDist.forEach(subCount => {
            diskSubstats.push(substatsFixedPool[subCount])
        })
        // Upgrades choice
        const upgrades = [1, 1, 1, 1]
        for (let ups=0; ups<totalUps; ups++) {
            const pickedSub = chance.integer({ min: 0, max: 3})
            upgrades[pickedSub]++
        }
        // Rolls count 
        let goodRolls = 0
        if (goodPools) {
            goodPools.forEach(pool => {
                const subIndex = diskSubstats.indexOf(pool)
                if (subIndex !== -1) {
                    goodRolls += upgrades[subIndex]
                }
            });
        }
        // Disk Config 
        const disk = {}
        disk.pos = j
        disk.goodRolls = goodRolls
        // Disk push
        disks.push(disk)
    }
    return disks
}