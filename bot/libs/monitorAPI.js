const axios = require('axios').default

module.exports = function (cb) {

    let timer1 = null
    let timer2 = null

    console.log('bot started...')


    timer1 = setInterval(async function (callback) {

        console.log('timer 1...')

        let response = null
        
        try {
            response = await axios.get('https://api.store.nvidia.com/partner/v1/feinventory?skus=DE~NVGFT070~NVGFT080~NVGFT090~NVLKR30S~NSHRMT01~NVGFT060T~187&locale=DE')
            console.log(response.data.listMap)
            await callback(null)
        } catch (error) {
            console.log(error)
            clearInterval(timer1)
        }

    }, 5000, cb)

   
}