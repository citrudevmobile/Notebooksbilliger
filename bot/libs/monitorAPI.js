import fetch from 'node-fetch'
import HttpsProxyAgent from 'https-proxy-agent'

export default function (cb) {

    let timer1 = null
    let timer2 = null

    console.log('bot started...')

    timer1 = setInterval(async function (callback) {

        console.log('timer 1...')

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
            response = await fetch('https://api.store.nvidia.com/partner/v1/feinventory?skus=DE~NVGFT070~NVGFT080~NVGFT090~NVLKR30S~NSHRMT01~NVGFT060T~187&locale=DE',{agent: new HttpsProxyAgent('basic.dreamproxies.io:31112:yzor1c6scv:Bj9VYo37X7JbdEOs_country-Germany_session-iD37eQWS')});
            data = await response.json();
            console.log(data)
            products = data.listMap.filter(function (product) { return skus.includes(product.fe_sku) && product.is_active == 'true' })
            
            while (x < products.length) {
                await callback(products[x])
                x++
            }

            if (products.length) {
                clearInterval(timer1)
                console.log('timer1 stopped...')    
            }

        } catch (error) {
            console.log(error)
            clearInterval(timer1)
        }

    }, 50000, cb)


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
            response = await fetch('https://api.store.nvidia.com/partner/v1/feinventory?skus=NL~NVGFT070~NVGFT080~NVGFT090~NVLKR30S~NSHRMT01~NVGFT060T~187&locale=NL');
            data = await response.json()
           
            products = data.listMap.filter(function (product) { return skus.includes(product.fe_sku) && product.is_active == 'false' })
        
            while (x < products.length) {
                await callback(products[x])
                x++
            }

            if (products.length) {
                clearInterval(timer2) 
                console.log('timer2 stopped...')  
            }
        } catch (error) {
            console.log(error)
            clearInterval(timer2)
        }

    }, 50000, cb)
}