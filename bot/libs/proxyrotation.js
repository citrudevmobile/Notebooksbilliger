import fs from 'fs'
import path from 'path'

const proxies = [

]

let lastRandNumForFreeProxies = 0


fs.readFile(path.join(process.cwd(), '\\libs\\proxies.txt'), 'utf8', function(err,data) {
    if(err) throw err;
    data.split(/\r?\n/).forEach(line =>  {
        let proxy = line.split(' ')
        let proxyData = {proxy: proxy[0], port: proxy[1]}
        proxies.push(proxyData)
    })
})


let generateRandNum  = function (proxyArray) {
    return Math.floor(Math.random() * proxyArray.length)
}


let rotateProxies = function () {
    let randNum = generateRandNum(freeProxies)
    if (lastRandNumForFreeProxies != randNum) {
        lastRandNumForFreeProxies = randNum
        return freeProxies[randNum]
    } else {
        randNum = generateRandNum(freeProxies)
        lastRandNumForFreeProxies = randNum
        return freeProxies[randNum]
    }
}


export {
    rotateProxies
}