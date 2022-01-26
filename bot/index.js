
import monitorAPI  from './libs/monitorAPI.js'
import Workers from './libs/workers.js'
import Tasks from './tasks.js'
import discordMessage from './libs/discordMessage.js'


let readyWorkers = []

Workers(function(pubsub) {

    pubsub.subscribe('ready_worker', function (data) {
        logger.log(`${new Date(Date.now()).toLocaleString('en-US')}|${data.workerName} is ready`)
        console.log(`${new Date(Date.now()).toLocaleString('en-US')}|${data.workerName} is ready`)
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
        logger.log(`${new Date(Date.now()).toLocaleString('en-US')}|product found: ${found}`)
        console.log(`${new Date(Date.now()).toLocaleString('en-US')}|product found: ${found}`)
        try {
            for(const readyWorker of readyWorkers) {
               
                if (readyWorker) {
                    //discordMessage(`#Product Found`, `Found the product [ ${found.product_url} ] your searching for. Bot has assigned [${readyWorker}] to checkout product.`, true).send()
                    pubsub.publish(`${readyWorker}_checkout`, {
                        found: found
                    })
                } else {
                    logger.log(`${new Date(Date.now()).toLocaleString('en-US')}|Workers unavailabe to handle discovered product...`)
                    console.log(`${new Date(Date.now()).toLocaleString('en-US')}|Workers unavailabe to handle discovered product...`)
                    //discordMessage(`#Product Found`, `Found the product [ ${found.product_url} ] your searching for. However, workers are unavailabe to handle discovered product.`, false).send()
                }
            } 
        } catch (error) {
            logger.log(`${new Date(Date.now()).toLocaleString('en-US')}|${error}`)
            console.log(`${new Date(Date.now()).toLocaleString('en-US')}|${error}`)
        }
    })
})





