const { simplify, parse, combinations, factorial, multiply, fraction, pow, subtract, sum, mean, rationalize, number } = require('mathjs')


// Math functions
function binomialDist(n, k, p) {
    const combinationPart = combinations(n, k)
    const upgradeProb = pow(p, k)
    const nonUpProb = pow(subtract(1, p), n-k)
    return multiply(combinationPart, upgradeProb, nonUpProb)
}
function upgradesProb(baseRolls) {
    const totalProbs = []
    for (let i = 0; i < baseRolls + 6; i++) {
        totalProbs.push([])
        if (i < baseRolls) totalProbs[i].push(0)
        else totalProbs[i].push(multiply(binomialDist(5, i - baseRolls, fraction(baseRolls, 4)), fraction(1, 5))) 
    }
    for (let i = 0; i < baseRolls + 5; i++) {
        if (i < baseRolls) totalProbs[i].push(0)
        else totalProbs[i].push(multiply(binomialDist(4, i - baseRolls, fraction(baseRolls, 4)), fraction(4, 5)))
    }
    totalProbs.forEach((array, index) => {
        totalProbs[index] = sum(array)
    })
    return totalProbs
}
function polyMultiply (fArr, sArr) {
    const mainArr = new Array(fArr.length + sArr.length - 1).fill(0)
    fArr.forEach((v, i) => {
        sArr.forEach((a, j) => {
            mainArr[i + j] = sum(mainArr[i + j], multiply(v, a))
        })
    })
    return mainArr
}

// Result functions
function probsPopulate(isBlocked, goodPools, preDist, preDistGP) {
    const realProbs = []
    for (let k = 0; k < Math.min(goodPools, 4) + 6; k++) realProbs.push([])
    let totalSubs = 10
    if (isBlocked) totalSubs = 9
    if (preDist) totalSubs -= preDist
    const leftPools = 4 - (preDist || 0)
    const leftGP = goodPools - (preDistGP || 0)
    const leftDist = (preDist || 0) - (preDistGP || 0)
    const totalDisks = combinations(totalSubs, leftPools)
    for (let i = 0; i < Math.min(goodPools, 4) + 1; i++) {
        if (i < (preDistGP || 0) || i > 4 - leftDist) continue
        const disksWithIPollsPerWay = totalSubs - leftGP >= 4 - leftDist - i
         ? fraction(combinations(totalSubs - leftGP, 4 - leftDist - i ), totalDisks)
         : 0
        const ways = fraction(combinations(leftGP, i - (preDistGP || 0)))
        const distProb = multiply(ways, disksWithIPollsPerWay)
        const upsProb = upgradesProb(i)
        upsProb.forEach((array, index) => {
            const realProb = multiply(distProb, array)
            realProbs[index].push(realProb)
        })
    }
    realProbs.forEach((array, index) => {
        realProbs[index] = sum(array.length ? array : 0)
    })
    return realProbs
}
function farmProbs(diskCount, probs) {
    const farmProbs = []
    probs.forEach((rollsProb) => {
        const noDropProb = pow(subtract(1, rollsProb), diskCount)
        const dropProb = subtract(1, noDropProb)
        farmProbs.push(dropProb)
    })
    return farmProbs
}
function accProbs(isBlocked, diskCount, goodPools, preDist, preDistGP) {
    const accArray = []
    const preValuesArr = probsPopulate(isBlocked, goodPools, preDist, preDistGP)
    preValuesArr.forEach((prob, index) => {
        let probAcc = 0
        for (let i = index; i > -1; i--) {
            const preSum = sum(preValuesArr[i], probAcc)
            probAcc = preSum
        }
        const preAcc = subtract(probAcc, preValuesArr[index])
        const totalAcc = subtract(pow(probAcc, diskCount), pow(preAcc, diskCount))
        accArray.push(totalAcc)
    })
    return accArray
}
function PGF (slotsAccProbs) {
    const totalProbs = slotsAccProbs.reduce((acc, slot) => {
        return polyMultiply(acc, slot)
    })
    return totalProbs
}
// Future use
// function slotInvData(maxDiskCount, line) {
//     const data = []
//     for (let i = 1; i < maxDiskCount + 1; i++) {
//         const lineProb = farmProbs(i, probsPopulate(true))[line].toString()
//         const xData = { x: i, y: lineProb }
//         data.push(xData)
//     }
//     return data
// }

// Exports
function mathTaskA(isBlocked, goodPoolsCount, preDist, preDistGP) {
    const result = [] 
    probsPopulate(isBlocked, goodPoolsCount, preDist, preDistGP).forEach(elm => {result.push(number(elm))})
    return result
}
function mathTaskB_Normal(isBlocked, goodPoolsCount, pDisks, preDist, preDistGP) {
    const result = []
    farmProbs(pDisks, probsPopulate(isBlocked, goodPoolsCount, preDist, preDistGP)).forEach(elm => {result.push(number(elm))})
    return result
}
function mathTaskB_Max(isBlocked, goodPoolsCount, pDisks, preDist, preDistGP) {
    const result = []
    accProbs(isBlocked, pDisks, goodPoolsCount, preDist, preDistGP).forEach(elm => {result.push(number(elm))})
    return result
}
function mathTaskC(slotAccs) {
    const result = []
    PGF(slotAccs).forEach(elm => {result.push(number(elm))})
    return result
}
module.exports = { mathTaskA, mathTaskB_Normal, mathTaskB_Max, mathTaskC}