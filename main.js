const path = require("path")
const Piscina = require("piscina")
const { rollup, sum } = require("d3-array")

const piscinaDisks = new Piscina({
  filename: path.resolve(__dirname, "getDisks.js"),
});

async function getDisks (totalDisks, n, goodPools, i) {
    const result = await piscinaDisks.run({ n, goodPools, i})
    for (const disk of result) {
        totalDisks.push(disk)
    }
}
async function taskA() {
    const Y = 10 // Amount of cpu cores you will use for speed up the simulations
    const N = 100000 // Amount of disks generated for each core
    const gP = [12102] // Substats/Upgrades counted as "rolls"
    const totalDisks = []
    const promises = []
    for (let i = 0; i < Y; i++) {
        promises.push(getDisks(totalDisks, N, gP, i))
    }
    await Promise.all(promises)
    const rollsCount = rollup(totalDisks, v => (v.length/(N*Y))*100, d => d.goodRolls)
    console.log(rollsCount)
}
// You can read more data about disks, this config just confirms individual probs in the console
// taskA()

const piscinaPlayers = new Piscina({
  filename: path.resolve(__dirname, "playerData.js"),
});

async function getPlayerDiskData (playersResult, p, n, goodPools) {
    const result = await piscinaPlayers.run({ p, n, goodPools })
    for (const player of result) {
        playersResult.push(player)
    }
}

async function taskB() {
    const Y = 10 // CPU cores
    const P = 100000 // Players per core
    const N = 21 // Disks per "player"
    const gP = [21103, 20103] // Rolls pools
    const playersResult = []
    const promises = []
    for (let i = 0; i < Y; i++) {
        promises.push(getPlayerDiskData(playersResult, P, N, gP))
    }
    await Promise.all(promises)
    const playersCount = {
    }
    for (let a = 0; a < (gP.length + 6); a++) {
        playersCount[`has-${a}`] = (sum(playersResult, p => p[`has-${a}`]))/P*Y
    }
    console.log(playersCount)
}
taskB()