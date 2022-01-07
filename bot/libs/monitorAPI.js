//const axios = require('axios').default
import fetch from 'node-fetch'

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

            response = await fetch('https://api.store.nvidia.com/partner/v1/feinventory?skus=DE~NVGFT070~NVGFT080~NVGFT090~NVLKR30S~NSHRMT01~NVGFT060T~187&locale=DE');
            data = await response.json();
            
            products = data.listMap.filter(function (product) { return skus.includes(product.fe_sku) && product.is_active == 'true' })
            
            while (x <= products.length) {
                await callback(products[x])
                x++
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
           
            products = data.listMap.filter(function (product) { return skus.includes(product.fe_sku) && product.is_active == 'true' })
            
            while (x <= products.length) {
                await callback(products[x])
                x++
            }
        } catch (error) {
            console.log(error)
            clearInterval(timer2)
        }

    }, 50000, cb)
}