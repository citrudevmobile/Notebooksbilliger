
import monitorAPI  from './libs/monitorAPI.js'
import Workers from './libs/workers.js'
import Tasks from './tasks.js'
import discordMessage from './libs/discordMessage.js'

let readyWorkers = []

Workers(function(pubsub) {

    pubsub.subscribe('ready_worker', function (data) {
        console.log(`${data.workerName} is ready`)
        discordMessage(`#Bot Worker Ready`, `[${data.workerName}] is ready and waiting for discovered product.`).send()
        if(readyWorkers.length == 0) {
            setTimeout(function (pubsub) {
                pubsub.publish('monitor_api')
            }, 50000, pubsub)
        }

        readyWorkers.push(data.workerName)
    })


    for (const task of Tasks) {
        pubsub.publish('start_worker',task)
    }

    
    monitorAPI(pubsub, function(found) {
        console.log(found)
        try {
            let readyWorker = readyWorkers.shift()
            if (readyWorker) {
                discordMessage(`#Product Found`, `Found the product [${found.product_url}] your searching for. Bot has assigned [${readyWorker}] to checkout product.`).send()
                pubsub.publish(`${readyWorker}_checkout`, {
                    found: found
                })
            } else {
                console.log('Workers unavailabe to handle discovered product...')
            }
        } catch (error) {
            console.log(error)
        }
    })
})





