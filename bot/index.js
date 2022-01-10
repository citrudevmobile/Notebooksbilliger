
import monitorAPI  from './libs/monitorAPI.js'
import Workers from './libs/workers.js'

let readyWorkers = []

Workers(async function(pubsub) {

    pubsub.subscribe('ready_worker', function (data) {
        console.log(`Worker ${data.workerName} is ready`)
        readyWorkers.push(data.workerName)
    })

    pubsub.publish('start_worker', {
        workerName: 'worker1',
        userEmail: 'monyo.kapa88@gmail.com',
        userPassword: 'QWERT12345',
        proxyServer: 'http://basic.dreamproxies.io:31112',
        proxyUser: 'yzor1c6scv',
        proxyPassword: 'Bj9VYo37X7JbdEOs_country-Germany'
    })

    pubsub.publish('start_worker', {
        workerName: 'worker2',
        userEmail: 'nemeth.judit8806@gmail.com',
        userPassword: 'QWERT12345',
        proxyServer: 'http://basic.dreamproxies.io:31112',
        proxyUser: 'yzor1c6scv',
        proxyPassword: 'Bj9VYo37X7JbdEOs_country-Germany'
    })

    monitorAPI(async function(found) {
        console.log(found)
        try {
            let readyWorker = readyWorkers.shift()
            if (readyWorker) {
                pubsub.publish('update_product_list', {
                    workerName: readyWorker,
                    found: found
                })
                console.log("Product found: started add to cart and checkout task...")
            } else {
                console.log('Workers unavailabe to handle discovered product...')
            }
        } catch (error) {
            console.log(error)
        }
    })
})





