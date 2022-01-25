
import monitorAPI  from './libs/monitorAPI.js'
import Workers from './libs/workers.js'
import Tasks from './tasks.js'
import discordMessage from './libs/discordMessage.js'


let readyWorkers = []

Workers(function(pubsub) {

    pubsub.subscribe('ready_worker', function (data) {
        logger.log(`${data.workerName} is ready`)
        console.log(`${data.workerName} is ready`)
        if(readyWorkers.length == 0) {
            setTimeout(function (pubsub) {
                pubsub.publish('monitor_api')
            }, 5000, pubsub)
        }

        readyWorkers.push(data.workerName)
    })


    for (const task of Tasks) {
        pubsub.publish('start_worker',task)
    }

    
    monitorAPI(pubsub, function(found) {
        logger.log(`product found: ${found}`)
        console.log(`product found: ${found}`)
        try {
            for(const readyWorker of readyWorkers) {
               
                if (readyWorker) {
                    //discordMessage(`#Product Found`, `Found the product [ ${found.product_url} ] your searching for. Bot has assigned [${readyWorker}] to checkout product.`, true).send()
                    pubsub.publish(`${readyWorker}_checkout`, {
                        found: found
                    })
                } else {
                    console.log('Workers unavailabe to handle discovered product...')
                    //discordMessage(`#Product Found`, `Found the product [ ${found.product_url} ] your searching for. However, workers are unavailabe to handle discovered product.`, false).send()
                }
            } 
        } catch (error) {
            console.log(error)
        }
    })
})





