import fs from 'fs'
import path from 'path'

let proxies = []

let lastRandNumForFreeProxies = 0

fs.readFile(path.join(process.cwd(), 'proxies.txt'), 'utf8', function (err, data) {
    if (err) throw err;
    data.split(/\r?\n/).forEach(line => {
        let proxy = line.split(':')
        let proxyData = { proxy: proxy[0], port: proxy[1], user: proxy[2], password: proxy[3] }
        proxies.push(proxyData)
    })
})

let generateRandNum = function (proxyArray) {
    return Math.floor(Math.random() * proxyArray.length)
}

let rotateProxies = function () {
    let randNum = generateRandNum(proxies)
    if (lastRandNumForFreeProxies != randNum) {
        lastRandNumForFreeProxies = randNum
        return proxies[randNum]
    } else {
        randNum = generateRandNum(proxies)
        lastRandNumForFreeProxies = randNum
        return proxies[randNum]
    }
}

let badProxy = function (_proxy) {
    proxies = proxies.filter((proxy) => {return proxy.proxy != _proxy.proxy })
}

let totalProxies = function () {
    return proxies.length
}

export {
    rotateProxies,
    badProxy,
    totalProxies
}