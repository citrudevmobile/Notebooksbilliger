const request = require('request-promise-native');
const poll = require('promise-poller').default;
const timeout = millis => new Promise(resolve => setTimeout(resolve, millis))// simulate delay

/*
*send captcha to be solved and get request id
*
*/
async function initiateCaptchaRequest(apiKey, siteDetails) {
    const formData = {
      method: 'base64',
      key: apiKey,
      body: siteDetails.base64String,
      json: 1, 
      regsense: 1
    }
    const response = await request.post('http://2captcha.com/in.php', {form: formData});
    return JSON.parse(response).request;
}
  
/*
Waiting for result of captcha solve request 
*/
  async function pollForRequestResults(key, id, retries = 30, interval = 1500, delay = 15000) {
    await timeout(delay);
    return poll({
      taskFn: requestCaptchaResults(key, id),
      interval,
      retries
    });
  }
  
  function requestCaptchaResults(apiKey, requestId) {
    const url = `http://2captcha.com/res.php?key=${apiKey}&action=get&id=${requestId}&json=1`;
    return async function() {
      return new Promise(async function(resolve, reject){
        const rawResponse = await request.get(url);
        const resp = JSON.parse(rawResponse);
        if (resp.status === 0) return reject(resp.request);
        resolve(resp.request);
      });
    }
  }
  

  module.exports = {
    pollForRequestResults,
    initiateCaptchaRequest
  }