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
        

        console.log(`${workerName} started`)
        
        if (!workers.includes(workerName)){
            workers.push(workerName)
            //`--blink-settings=imagesEnabled=false`
            // `--blink-settings=imagesEnabled=false`
            try {
                browser = await puppeteer.launch({
                    headless: false,
                    defaultViewport: null,
                    executablePath: `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`,
                    args:['--start-maximized', `--proxy-server=${data.proxyServer}`,],
                })
            } catch (error) {
                try {//`--blink-settings=imagesEnabled=false`
                    browser = await puppeteer.launch({
                        headless: false,
                        defaultViewport: null,
                        args:['--start-maximized', `--proxy-server=${data.proxyServer}`, ],
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

              
               

                let retry = 10
                let x = 0
                while (x < retry) {
                    try {
                        await page.setUserAgent(randUserAgent.toString())
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
                        console.log(error)
                        console.log(`${workerName} retry login...`)
                    }
                    x++
                }
                
               
                if ((await page.$('#haccount'))) {

                            await pubsub.publish('ready_worker', {
                                workerName: workerName
                            })

                            pubsub.subscribe('maintain_session', async function (data) {
                                try {
                                    await page.goto(storeUrl, {waitUntil: 'networkidle0', timeout: 50000})
                                    console.log(`${workerName} is maintaining session...`)
                                } catch (error) {

                                }
                            })
                            
                            pubsub.subscribe(`${data.workerName}_checkout`, async function (result) {
                                
                                pubsub.unsubscribe('maintain_session')
                                pubsub.unsubscribe('maintain_session')

                                try {
                                    execTimer.start()
                                    await page.waitForSelector(`#haccount`)
                                    console.log(`Product found: started add to cart and checkout task...`)
                                    while (true) {
                                        try {
                                           
                                            await page.goto(result.found.product_url, { waitUntil: 'domcontentloaded', timeout: 50000 })
                                            await page.waitForSelector(`form[name='cart_quantity']`)
                                            
                                            await Promise.all([
                                                page.$eval(`form[name='cart_quantity']`, form => form.submit()),
                                                page.waitForNavigation('domcontentloaded')
                                            ])
                                            
                                            console.log('added to cart...')
                                           
                                            await page.goto('https://www.notebooksbilliger.de/kasse', { waitUntil: 'domcontentloaded', timeout: 50000 })
                                            
                                            while (true) {
                                                try {
                                                    if ((await page.$x("//button[contains(., 'Click to start verification')]")) !== null) {
                                                        await page.waitForXPath("//button[contains(., 'Click to start verification')]")
                                                        const [button] = await page.$x("//button[contains(., 'Click to start verification')]");
                                                        if (button) {
                                                            await button.click();
                                                        }
                                                        break;
                                                    } else {
                                                        console.log('Captcha not found...')
                                                    }
                                                } catch (error) {
                                                    console.log(error)
                                                }
                                            }
                                            
                                            execTimer.stop()

                                            await page.waitForTimeout(100000)
                                           
                                            break
                                        } catch (error) {
                                            console.log(`${data.workerName}: error occured during checkout process trying again...`)
                                        }
                                    }
                                } catch (error) {
                                    console.log(`${data.workerName}: error occured during checkout process...`)
                                    //discordMessage(`#${data.workerName} failed to checkout product.`, `contact admin for your bot to findout more`, false).send()
                                }
                            })

                } else {
                    console.log(`${data.workerName} failed to login. Please check proxy`)
                }
        
            } catch (error) {
                console.log(error)
            }
        }
    })
    cb(pubsub)
}