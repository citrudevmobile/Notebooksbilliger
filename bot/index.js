
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
        proxyServer: 'deu.resi.dreamproxies.io:26371',
        proxyUser: '6M1mec8j',
        proxyPassword: 'Q2W2Y50dh7RJDfP6NaCg9u9n66tRdpykRLO74Ob23hBoZryeLYc6Q1qdlrXgPB2MY3xji-3VDrjf4P4Z'
    })

    pubsub.publish('start_worker', {
        workerName: 'worker2',
        userEmail: 'nemeth.judit8806@gmail.com',
        userPassword: 'QWERT12345',
        proxyServer: 'deu.resi.dreamproxies.io:26208',
        proxyUser: '6M1mec8j',
        proxyPassword: 'Q2W2Y50dh7RJDfP6NaCg9u9n66tRdpykRLO74Ob23hBoZryeLYc6Q1qdlrXgPB2MY3xji-JCgrP9QobC'
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





