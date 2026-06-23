const path = require("path")
const Piscina = require("piscina")
const Y = 1
const N = 20
const gP = [12102]
const totalDisks = []
// const fixedSeed = '#cy]FPMbPoP9]ay'

// function count(array, element) {
//     return array.reduce((acc, item) => item === element ? acc + 1 : acc, 0)
// }

const piscina = new Piscina({
  filename: path.resolve(__dirname, "getDisks.js"),
});

async function taskB (totalDisks, n, goodPools, seed) {
    const result = await piscina.run({ n, goodPools, seed})
    totalDisks.push(result)
}
async function main() {
    const promises = []
    for (let i = 0; i < Y; i++) {
        promises.push(taskB (totalDisks, N, gP))
    }
    await Promise.all(promises)
    console.log(totalDisks)
}
main()