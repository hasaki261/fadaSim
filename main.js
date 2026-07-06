const path = require("path")
const Piscina = require("piscina")
const { rollup } = require("d3-array")
const Y = 10 // Amount of cpu cores you will use for speed up the simulations
const N = 1000000 // Amount of disks generated for each core
// Disks Pre-Config
const gP = [12102] // Blocked Substats 
const totalDisks = []
// const fixedSeed = '#cy]FPMbPoP9]ay' 

const piscina = new Piscina({
  filename: path.resolve(__dirname, "getDisks.js"),
});

async function taskB (totalDisks, n, goodPools, seed) {
    const result = await piscina.run({ n, goodPools, seed})
    for (const disk of result) {
        totalDisks.push(disk)
    }
}
async function main() {
    const promises = []
    for (let i = 0; i < Y; i++) {
        promises.push(taskB (totalDisks, N, gP, i))
    }
    await Promise.all(promises)
    const rollsCount = rollup(totalDisks, v => (v.length/(N*Y))*100, d => d.goodRolls)
    console.log(rollsCount) 
}
// You can read more data about disks, this config just confirms individual probs in the console
main()