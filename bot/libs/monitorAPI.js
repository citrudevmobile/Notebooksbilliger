const axios = require('axios')

module.exports = function (cb) {
    
    let timer1 = null
    let timer2 = null

    timer1 = setinterval(function (callback) {
        axios.get('https://api.store.nvidia.com/partner/v1/feinventory?skus=DE~NVGFT070~NVGFT080~NVGFT090~NVLKR30S~NSHRMT01~NVGFT060T~187&locale=DE').then(function (response) {
            
            console.log(response.data.listMap)
            callback(null)
           
        }).catch(function (error) {

            console.log(error)
            clearInterval(timer1)
        })

    }, 10000, cb)

    timer2 = setinterval(function (callback) {
        axios.get('https://api.store.nvidia.com/partner/v1/feinventory?skus=NL~NVGFT070~NVGFT080~NVGFT090~NVLKR30S~NSHRMT01~NVGFT060T~187&locale=NL').then(function (response) {
           
            console.log(response.data.listMap)
            callback(null)

        }).catch(function (error) {

            console.log(error)
            clearInterval(timer2)
        })

    }, 100000, cb)
}