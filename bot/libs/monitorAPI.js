import axios from 'axios-https-proxy-fix'

export default function (pubsub, cb) {
    
    const time = 3000
    let timer1 = null
    let timer2 = null
    let counter = 0
    

    console.log('bot started...')

    pubsub.subscribe('monitor_api', async (data) => { 

        console.log('monitor api started...')
        
        timer1 = setInterval(async function (callback) {

            console.log('timer 1...')

            if (counter > 30) {
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
    
                response = await axios.get('https://www.mockachino.com/27bcb9bb-1e22-45/users', {
                /*    
                proxy: {
                        protocol:'http',
                        host: 'basic.dreamproxies.io',
                        port: '31112',
                        auth: {
                          username: 'yzor1c6scv',
                          password: 'Bj9VYo37X7JbdEOs_country-Germany'
                        }
                      }
                      */
                })
                
                products = response.data.listMap.filter(function (product) { return skus.includes(product.fe_sku) && product.is_active == 'true' })
                
                while (x < products.length) {
                    callback(products[x])
                    x++
                }
    
                if (products.length) {
                    clearInterval(timer1)
                    clearInterval(timer2) 
                    
                    console.log('timers stopped...')    
                }
    
            } catch (error) {
                console.log(error)
                clearInterval(timer1)
                clearInterval(timer2) 
            }
    
        }, time, cb)
    
        /*
        timer2 = setInterval(async function (callback) {
    
            console.log('timer 2...')
    
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
                    clearInterval(timer1)
                    clearInterval(timer2) 
                    console.log('timers stopped...')  
                }
            } catch (error) {
                console.log(error)
                clearInterval(timer1)
                clearInterval(timer2)      
            }
    
        }, time, cb)
        */


    })

  
}