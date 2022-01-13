import PubSub from 'PubSub'
import puppeteer from 'puppeteer-extra'
import executionTime from 'execution-time'
import UserAgent from 'user-agents'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import discordMessage from './discordMessage.js'

const randUserAgent = new UserAgent({ deviceCategory: 'desktop' })
const pubsub = new PubSub();
const storeUrl = `https://www.notebooksbilliger.de/`
const loginPage = `https://www.notebooksbilliger.de/kundenkonto/anmelden/regis/register`

let execTimer = executionTime(console.log)
let workers = []

puppeteer.use(StealthPlugin())

export default function (cb) {

    pubsub.subscribe('start_worker', async (data) => {
        
        let workerName = data.workerName
        let browser = null
        let maintainSession = true

        console.log(`${workerName} started`)
        
        if (!workers.includes(workerName)){
            workers.push(workerName)
            //`--blink-settings=imagesEnabled=false`
            try {
                browser = await puppeteer.launch({
                    headless: false,
                    defaultViewport: null,
                    executablePath: `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`,
                    args:['--start-maximized', `--proxy-server=${data.proxyServer}`, ],
                })
            } catch (error) {
                try {
                    browser = await puppeteer.launch({
                        headless: false,
                        defaultViewport: null,
                        args:['--start-maximized', `--proxy-server=${data.proxyServer}`],
                    })
                } catch (error) {
                    console.log(error)
                }
            }
        
            try {
            
                const page = (await browser.pages())[0]
        
                await page.authenticate({
                    username: data.proxyUser,
                    password: data.proxyPassword,
                })
        
                await page.setUserAgent(randUserAgent.toString())

                let retry = 5
                let x = 0
                while (x < retry) {
                    try {
                        await page.goto(storeUrl, {waitUntil: 'networkidle0', timeout: 50000})
                        await page.waitForSelector('#uc-btn-accept-banner', { timeout: 50000 })
                        await page.click('#uc-btn-accept-banner', { delay: 300 })
                        await page.goto(loginPage, {waitUntil: 'networkidle0', timeout: 100000})
                        await page.waitForSelector('#f_email_address', { timeout: 100000 })
                        await page.waitForSelector('#f_password', { timeout: 100000 })
                        await page.type('#f_email_address', data.userEmail, {delay: 300})
                        await page.type('#f_password', data.userPassword, {delay: 300})
                        await page.click(`button[value="Weiter"]`, {delay: 300})
                        await page.waitForSelector('#haccount',{ timeout: 100000 })
                        break;
                    } catch (error) {
                        console.log('failed to login...')
                    }
                    x++
                }
                
               
                if ((await page.$('#haccount'))) {

                            await pubsub.publish('ready_worker', {
                                workerName: workerName
                            })

                            //handle add to cart and checkout...
                            pubsub.subscribe(`${data.workerName}_checkout`, async function (result) {
                                maintainSession = false
                                try {
                                    console.log("Product found: started add to cart and checkout task...")
                                    execTimer.start()
                                    while (true) {
                                        try {
                                            await page.goto(result.found.product_url, { waitUntil: 'networkidle0', timeout: 50000 })
                                            await page.waitForSelector(`form[name='cart_quantity']`)
                                            console.log('found add to cart button...')
                                            const form = await page.$(`form[name='cart_quantity']`);
                                            await form.evaluate(form => form.submit()); 
                                            console.log('added to cart...')
                                            await page.goto('https://notebooksbilliger.de/warenkorb', { waitUntil: 'networkidle0', timeout: 50000 })
                                            break
                                        } catch (error) {
                                            console.log('error from add to cart and checkout handler')
                                        }
                                    }
                                    execTimer.stop()
                                } catch (error) {
                                    console.log(`${data.workerName}: error occured during checkout process...`)
                                    //discordMessage(`#${data.workerName} failed to checkout product.`, `contact admin for your bot to findout more`, false).send()
                                }
                            })


                            pubsub.subscribe('maintain_session', async function (data) {
                                try {
                                    await page.evaluate(() => {
                                        location.reload(true)
                                     })
                                    console.log(`${workerName} is maintaining session...`)
                                } catch (error) {

                                }
                            })
                    

                } else {

                    console.log(`${data.workerName} failed to login. Please check proxy`)
                    //discordMessage(`#${data.workerName} failed to login.`, `Please check proxy or restart bot. ${data.workerName}  may have been blocked`, false).send()
                }
        
            } catch (error) {
        
                console.log(error)
            }
        }
            
      
    })


    cb(pubsub)

}