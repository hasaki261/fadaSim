const Chance = require("chance")
const chance = new Chance()
const nameData = require('./subname.json')

module.exports = ({ n, goodPools, seed }) => {
    const disks = []
    for (let j=0; j<n; j++) {
        const randomSeed = chance.string({ length: 15 })
        const diskChance = seed ? new Chance(seed) : new Chance(randomSeed)
        // Mainstats Config
        const mainStat = 11103
        const substatsPool = [31203, 12103, 12102, 21103, 20103, 13103, 13102, 11103, 11102, 23203]
        const substatsFixedPool = substatsPool.filter(subStat => subStat !== mainStat)
        // Subs choice
        const diskSubsDist = diskChance.unique(diskChance.integer, 4, {min: 0, max: substatsFixedPool.length - 1})
        const diskSubstats = []
        diskSubsDist.forEach(subCount => {
            diskSubstats.push(substatsFixedPool[subCount])
        })
        // Upgrades choice
        const upgrades = [1, 1, 1, 1]
        for (let ups=0; ups<4; ups++) {
            const pickedSub = diskChance.integer({ min: 0, max: 3})
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
        disk.mainStat = {name: nameData[mainStat], id: mainStat}
        disk.frstSub = { name: nameData[diskSubstats[0]], id: diskSubstats[0], rolls: upgrades[0] }
        disk.SecSub = { name: nameData[diskSubstats[1]], id: diskSubstats[1], rolls: upgrades[1] }
        disk.ThrdSub = { name: nameData[diskSubstats[2]], id: diskSubstats[2], rolls: upgrades[2] }
        disk.FothSub = { name: nameData[diskSubstats[3]], id: diskSubstats[3], rolls: upgrades[3] }
        disk.goodRolls = goodRolls
        disk.seed = seed ? seed : randomSeed
        // Disk push
        disks.push(disk)
    }
    return disks
}