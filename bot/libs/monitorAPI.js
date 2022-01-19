import axios from 'axios-https-proxy-fix'
import { rotateProxies } from './proxyrotation.js'

export default function (pubsub, cb) {
    
    const time = 3000
    let timer1 = null
    let timer2 = null
    let counter = 0
    

    console.log('Bot started...')

    pubsub.subscribe('monitor_api', async (data) => {  

        console.log('Monitoring API...')
       
        timer1 = setInterval(async function (callback) {

            console.log('API 1 request...')

            if (counter > 10) {
                pubsub.publish('maintain_session')
                counter = 0
            } else {
                counter++
            }
            
    
            let response = null
            let products = []
            let data = null
            let skus = [
            "NVGFT070T_DE", 
            "NVGFT080_DE",
            "NVGFT070_DE",
            "NVGFT060T_DE",
            "NVGFT080T_DE"
            ]
            let x = 0
            //https://api.store.nvidia.com/partner/v1/feinventory?skus=DE~NVGFT070~NVGFT080~NVGFT090~NVLKR30S~NSHRMT01~NVGFT060T~187&locale=DE', { agent: new HttpsProxyAgent('https://Bj9VYo37X7JbdEOs_country-Germany_session-iD37eQWS:yzor1c6scv@basic.dreamproxies.io:31112
            //https://www.mockachino.com/27bcb9bb-1e22-45/users
            try {
                let randProxy = rotateProxies()
                console.log(randProxy)
                response = await axios.get('https://www.mockachino.com/27bcb9bb-1e22-45/users', {
                
                proxy: {
                    protocol:'http',
                    host: randProxy.proxy,
                    port: randProxy.port,
                }
                        
                })
                
                products = response.data.listMap.filter(function (product) { return skus.includes(product.fe_sku) && product.is_active == 'true' })
                
                while (x < products.length) {
                    callback(products[x])
                    x++
                }
    
                if (products.length) {
                    pubsub.unsubscribe('maintain_session')
                    clearInterval(timer1)
                    clearInterval(timer2)         
                    console.log('timers stopped...')    
                }
    
            } catch (error) {
                console.log(error)
                pubsub.unsubscribe('maintain_session')
                clearInterval(timer1)
                clearInterval(timer2) 
            }
    
        }, time, cb)
    
        /*
        timer2 = setInterval(async function (callback) {
    
            console.log('API 1 request...')
    
            let response = null
            let products = []
            let data = null
            let skus = [
            "NVGFT070T_DE", 
            "NVGFT080_DE",
            "NVGFT070_DE",
            "NVGFT060T_DE",
            "NVGFT080T_DE"
            ]
            let x = 0
    
            try {
                response = await axios.get('https://api.store.nvidia.com/partner/v1/feinventory?skus=NL~NVGFT070~NVGFT080~NVGFT090~NVLKR30S~NSHRMT01~NVGFT060T~187&locale=NL');
                
                products = response.data.listMap.filter(function (product) { return skus.includes(product.fe_sku) && product.is_active == 'false' })
            
                while (x < products.length) {
                    callback(products[x])
                    x++
                }
    
                if (products.length) {
                    pubsub.unsubscribe('maintain_session')
                    clearInterval(timer1)
                    clearInterval(timer2)         
                    console.log('timers stopped...')     
                }
            } catch (error) {
                pubsub.unsubscribe('maintain_session')
                clearInterval(timer1)
                clearInterval(timer2)         
                console.log('timers stopped...')        
            }
    
        }, time, cb)
        */


    })

  
}