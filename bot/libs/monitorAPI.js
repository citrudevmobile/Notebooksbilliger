const axios = require('axios')

module.exports = function (cb) {
    let timer1 = null
    let timer2 = null

    timer1 = setinterval(function (callback) {
        axios.get('https://api.store.nvidia.com/partner/v1/feinventory?skus=DE~NVGFT070~NVGFT080~NVGFT090~NVLKR30S~NSHRMT01~NVGFT060T~187&locale=DE').then(function (response) {
            console.log(response);
        }).catch(function (error) {
            console.log(error);
        })

    }, 1000, cb)

    timer2 = setinterval(function (callback) {
        axios.get('https://api.store.nvidia.com/partner/v1/feinventory?skus=NL~NVGFT070~NVGFT080~NVGFT090~NVLKR30S~NSHRMT01~NVGFT060T~187&locale=NL').then(function (response) {
            console.log(response);
        }).catch(function (error) {
            console.log(error);
        })

    }, 1000, cb)
}