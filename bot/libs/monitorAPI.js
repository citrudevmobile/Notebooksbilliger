const axios = require('axios')

module.exports = function (cb) {

    let timer1 = null
    let timer2 = null

    console.log('bot started...')

    axios.get('https://api.store.nvidia.com/partner/v1/feinventory?skus=DE~NVGFT070~NVGFT080~NVGFT090~NVLKR30S~NSHRMT01~NVGFT060T~187&locale=DE').then(function (response) {
            
        console.log(response.data.listMap)
        cb(null)
       
    }).catch(function (error) {

        console.log(error)
        clearInterval(timer1)
    })

    timer1 = setInterval(function (callback) {
        console.log('timer 1...')
        axios.get('https://api.store.nvidia.com/partner/v1/feinventory?skus=DE~NVGFT070~NVGFT080~NVGFT090~NVLKR30S~NSHRMT01~NVGFT060T~187&locale=DE').then(function (response) {
            
            console.log(response.data.listMap)
            callback(null)
           
        }).catch(function (error) {

            console.log(error)
            clearInterval(timer1)
        })

    }, 1000, cb)

    timer2 = setInterval(function (callback) {
        console.log('timer 2...')
        axios.get('https://api.store.nvidia.com/partner/v1/feinventory?skus=NL~NVGFT070~NVGFT080~NVGFT090~NVLKR30S~NSHRMT01~NVGFT060T~187&locale=NL').then(function (response) {
           
            console.log(response.data.listMap)
            callback(null)

        }).catch(function (error) {

            console.log(error)
            clearInterval(timer2)
        })

    }, 1000, cb)
}