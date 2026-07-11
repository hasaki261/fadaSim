process.stdout.setMaxListeners(20)
const path = require("path")
const fs = require("fs")
const Piscina = require("piscina")
const inquirer = require("inquirer").default
const { rollup, sum } = require("d3-array")

const piscinaDisks = new Piscina({
  filename: path.resolve(__dirname, "getDisks.js"),
});

async function getDisks (totalDisks, n, goodPools, blockedSub) {
    const result = await piscinaDisks.run({ n, goodPools, blockedSub })
    for (const disk of result) {
        totalDisks.push(disk)
    }
}
async function taskA(Y, N, gP, blockedSub) {
    // const Y = 10 // Amount of cpu cores you will use for speed up the simulations
    // const N = 100000 // Amount of disks generated for each core
    // const gP = [12102] // Substats/Upgrades counted as "rolls"
    const totalDisks = []
    const promises = []
    for (let i = 0; i < Y; i++) {
        promises.push(getDisks(totalDisks, N, gP, blockedSub))
    }
    await Promise.all(promises)
    const rollsCount = rollup(totalDisks, v => (v.length/(N*Y))*100, d => d.goodRolls)
    const positioned = [...rollsCount].sort((a, b) => a[0] - b[0])
    console.log(`\x1b[92mResult: \n ${JSON.stringify(Object.fromEntries(positioned), null, 2)}\x1b[0m`)
}

const piscinaPlayers = new Piscina({
  filename: path.resolve(__dirname, "playerData.js"),
});

async function getPlayerDiskData (playersResult, p, n, goodPools, blockedSub) {
    const result = await piscinaPlayers.run({ p, n, goodPools, blockedSub })
    for (const player of result) {
        playersResult.push(player)
    }
}

async function taskB(Y, P, N, gP, blockedSub, mode = 'Normal') {
    // const Y = 10 // CPU cores
    // const P = 100000 // Players per core
    // const N = 21 // Disks per "player"
    // const gP = [21103, 20103] // Rolls pools
    const playersResult = []
    const promises = []
    for (let i = 0; i < Y; i++) {
        promises.push(getPlayerDiskData(playersResult, P, N, gP, blockedSub))
    }
    await Promise.all(promises)
    const playersCount = {}
    if (mode === 'Normal'){
        for (let a = 0; a < (gP.length + 6); a++) {
            playersCount[`has-${a}`] = (sum(playersResult, p => p[`has-${a}`]))/(P*Y)*100
        }
    } else {
        const playersMax = []
        playersResult.forEach(player => {
            for (let i = (gP.length + 5); i > -1; i--) {
                if (player[`has-${i}`]) return playersMax.push(i)
            }
        })
        for (let a = 0; a < (gP.length + 6); a++) {
            playersCount[`max-${a}`] = playersMax.filter(x => x === a).length/(P*Y)*100
        }
    }
    console.log(`\x1b[94mResult: \n ${JSON.stringify(playersCount, null, 2)}\x1b[0m`)
}

const piscinaBuilds = new Piscina({
    filename: path.resolve(__dirname, "playerBuilds.js")
})
async function getBuildSlotsData (buildsArr, p, N, slotsConfig) {
    const result = await piscinaBuilds.run({ p, N, slotsConfig })
    for (const build of result) {
        buildsArr.push(build)
    }
}
async function taskC(Y, P, N, file) {
    const date = new Date()
    const day = date.getDate()
    const month = date.getMonth() + 1
    const hour = date.getHours()
    const buildsArr = []
    const buildStatics = {}
    const configFile = fs.readFileSync(`./slots_config/${file}.json`, 'utf-8')
    const slotsConfig = JSON.parse(configFile)
    let totalRolls = 0
    slotsConfig.forEach(slot => {
        totalRolls += slot.goodPools.length + 5
    })
    const promises = []
    for (let i = 0; i < Y; i++) {
        promises.push(getBuildSlotsData(buildsArr, P, N, slotsConfig))
    }
    await Promise.all(promises)
    for (let a = 0; a < totalRolls + 1; a++) {
        buildStatics[a] = buildsArr.filter(x => x === a).length/(P*Y)*100
        fs.appendFileSync(`./sim_results/${day}_${month}_h${hour}_config-${file}.csv`, `${a}, ${buildStatics[a]} \n`)
    }
    console.log(`\x1b[92mResults in ${`${day}_${month}_h${hour}_config-${file}.csv`}\x1b[0m`)
}


// CLI config
const weightChoices = ['Fast 10x - Max ± 0.5%', 'Medium 100x - Max ± 0.15%', 'Heavy 1000x - Max ± 0.05%']
const configFiles = []
const files = fs.readdirSync('./slots_config', { withFileTypes: true })
for (const file of files) {
    if (!(file.isFile())) continue
    const fileExt = path.extname(file.name)
    const fileName = path.basename(file.name, fileExt)
    configFiles.push(fileName)
}
const CLI = () => {
    inquirer
     .prompt([
        {
            name: 'function',
            type: 'select',
            message: 'What task you want to simulate?',
            choices: ['TaskA', 'TaskB', 'TaskC']
        },
        {
            name: 'blockedSub',
            type: 'select',
            message: 'Blocked Substat (Mainstat):',
            choices: [
                'None',
                '11103 - PV Flat',
                '11102 - PV%',
                '12103 - ATK Flat',
                '12102 - ATK%',
                '13103 - DEF Flat',
                '13102 - DEF%',
                '20103 - Crit Rate',
                '21103 - Crit DMG',
                '31203 - Prof'
            ],
            default: 'None',
            when: (answers) => answers.function !== 'TaskC'
        },
        {
            name: 'goodPools',
            type: 'checkbox',
            message: 'Good Substats counted as Rolls:',
            choices: [
                '11103 - PV Flat',
                '11102 - PV%',
                '12103 - ATK Flat',
                '12102 - ATK%',
                '13103 - DEF Flat',
                '13102 - DEF%',
                '21103 - Crit DMG',
                '20103 - Crit Rate',
                '31203 - Prof',
                '23203 - Pen'
            ],
            when: (answers) => answers.function !== 'TaskC'
        },
        {
            name: 'weight',
            type: 'select',
            message: 'Amount of Simulations per Core (default: 1000) - Precision',
            choices: weightChoices,
            default: 'Medium 100x - Max ± 0.15%'
        },
        {
            name: 'cores',
            type: 'number',
            message: 'Amount of Cores:',
            default: 10,
            validate: (value) => {
                if (!Number.isInteger(value) || value <= 0) {
                    return `${value} must be a positive whole number`
                }
                return true
            }
        },
        {
            name: 'disks',
            type: 'number',
            message: 'Disks you want to simulate per player:',
            when: (answers) => answers.function === 'TaskB',
            validate: (value) => {
                if (!Number.isInteger(value) || value <= 0) {
                    return `${value} must be a positive whole number`
                }
                return true
            },
            default: 10
        },
        {
            name: 'diskSlots',
            type: 'number',
            message: 'Disks you want to simulate per slot:',
            when: (answers) => answers.function === 'TaskC',
            validate: (value) => {
                if (!Number.isInteger(value) || value <= 0) {
                    return `${value} must be a positive whole number`
                }
                return true
            },
            default: 10
        },
        {
            name: 'modeB',
            type: 'select',
            message: 'Which mode of taskB?',
            when: (answers) => answers.function === 'TaskB',
            choices: ['Normal', 'Max']
        },
        {
            name: 'configC',
            type: 'select',
            message: 'Slots config file:',
            when: (answers) => answers.function === 'TaskC',
            choices: configFiles
        },
     ]).then((answers) => {
            let weight = weightChoices.indexOf(answers.weight)
            if (weight === 0) weight = 10000
            else if (weight === 1) weight = 100000
            else if (weight === 2) weight = 1000000
            let totalWeight = answers.disks || answers.diskSlots ? (answers.disks || answers.diskSlots)*weight : weight
            if (answers.function === 'TaskC') {
                const configFile = fs.readFileSync(`./slots_config/${answers.configC}.json`, 'utf-8')
                const slotsConfig = JSON.parse(configFile)
                let disksPerBuild = 0
                slotsConfig.forEach(slot => {
                    disksPerBuild += Math.floor(slot.disksMult*answers.diskSlots)
                })
                totalWeight = weight*disksPerBuild
            }
            inquirer
             .prompt([
                {
                  name: 'validation',
                  type: 'confirm',
                  message: `Your simulation config is: \n ${JSON.stringify(answers, null, 2)} \n it will simulate a total of ${totalWeight} disks per core \n do you confirm? (n to redo)`
                },
             ]).then((answer) => {
                if (!answer.validation) {
                    return CLI()
                } else {
                    const blockedSub = answers.blockedSub === 'None' ? 0 :
                    answers.blockedSub ? Number(answers.blockedSub.split(' - ')[0]) : undefined
                    const goodPools = []
                    answers.goodPools?.forEach(pool => {
                        const poolId = pool.split(' - ')[0]
                        goodPools.push(Number(poolId))
                    })
                    if(answers.function === 'TaskA') {
                        taskA(answers.cores, weight, goodPools, blockedSub)
                    } else if (answers.function === 'TaskB') {
                        if (answers.modeB === 'Normal') taskB(answers.cores, weight, answers.disks, goodPools, blockedSub)
                        else if (answers.modeB === 'Max') taskB(answers.cores, weight, answers.disks, goodPools, blockedSub, 'Max')
                    } else if (answers.function === 'TaskC') {
                        taskC(answers.cores, weight, answers.diskSlots, answers.configC)
                    }
                }
             })
    })
}
CLI()