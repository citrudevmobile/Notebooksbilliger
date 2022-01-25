import PubSub from 'PubSub'
import puppeteer from 'puppeteer-extra'
import executionTime from 'execution-time'
import UserAgent from 'user-agents'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import logger from '../libs/logger.js'
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
        
        logger.log(`${Date.now()}|${workerName} started`)
        console.log(`${Date.now()}|${workerName} started`)
        
        if (!workers.includes(workerName)){
            workers.push(workerName)
            try {
                browser = await puppeteer.launch({
                    headless: false,
                    defaultViewport: null,
                    executablePath: `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`,
                    args:['--start-maximized', `--proxy-server=${data.proxyServer}`, `--blink-settings=imagesEnabled=false`],
                    
                })
            } catch (error) {
                try {
                    browser = await puppeteer.launch({
                        headless: false,
                        defaultViewport: null,
                        args:['--start-maximized', `--proxy-server=${data.proxyServer}`, `--blink-settings=imagesEnabled=false`],
                    })
                } catch (error) {
                    logger.log(`${Date.now()}|Puppeteer failed to start...`)
                    console.log(`${Date.now()}|Puppeteer failed to start...`)
                }
            }
        
            try {
            
                const page = (await browser.pages())[0]
                
                await page.authenticate({
                    username: data.proxyUser,
                    password: data.proxyPassword,
                })
                

                await page.setUserAgent(randUserAgent.toString())

              
                let retry = 10
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
                        logger.log(`${Date.now()}|${workerName} retry login...`)
                        logger.log(`${Date.now()}|${workerName} ${error}`)
                        console.log(`${workerName} retry login...`)
                        console.log(`${workerName} ${error}`)
                    }
                    x++
                }

                // Clear cart...
                if ((await page.$('#haccount'))) {
                    try {
                        await page.goto(`https://www.notebooksbilliger.de/warenkorb`, {waitUntil: 'networkidle0', timeout: 50000})
                        const allItemsInCart = await page.$$eval("button.js-remove-from-cart", el => el.map(x => x.getAttribute("data-delete-url")));
                        logger.log(`${Date.now()}|${workerName} removing items from cart...`)
                        logger.log(`${Date.now()}|${allItemsInCart}`)
                        console.log(`${Date.now()}|${workerName} removing items from cart...`)
                        console.log(`${Date.now()}|${allItemsInCart}`)
                        let x = 0
                        while (x < allItemsInCart.length) {
                            await page.goto(allItemsInCart[x], {waitUntil: 'domcontentloaded', timeout: 50000})
                            x++
                        }
                        await page.goto(storeUrl, {waitUntil: 'networkidle0', timeout: 50000})
                    } catch (error) {
                        console.log(error)
                    }
                }
               
                if ((await page.$('#haccount'))) {

                            await pubsub.publish('ready_worker', {
                                workerName: workerName
                            })

                            pubsub.subscribe('maintain_session', async function (data) {
                                try {
                                    await page.goto(storeUrl, {waitUntil: 'networkidle0', timeout: 50000})
                                    logger.log(`${Date.now()}|${workerName} is maintaining session...`)
                                    console.log(`${Date.now()}|${workerName} is maintaining session...`)
                                } catch (error) {

                                }
                            })
                            
                            pubsub.subscribe(`${data.workerName}_checkout`, async function (result) {
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
                                            
                                            logger.log(`${Date.now()}|${workerName} added product to cart...`)
                                            console.log(`${Date.now()}|${workerName} added product to cart...`)
                                           
                                            await page.goto('https://www.notebooksbilliger.de/kasse', { waitUntil: 'domcontentloaded', timeout: 50000 })
                                            
                                            while (true) {
                                                try {
                                                    await page.waitForXPath("//button[contains(., 'Click to start verification')]", {timeout: 500})
                                                    logger.log(`${Date.now()}|${workerName} captcha found...`)
                                                    console.log(`${Date.now()}|${workerName} captcha found...`)
                                                    await page.waitForTimeout(5000000)
                                                    const [button] = await page.$x("//button[contains(., 'Click to start verification')]");
                                                    if (button) {
                                                        await button.click();
                                                    }
                                                    await page.waitForSelector('.section-box-hd.head', {timeout: 100000})
                                                    logger.log(`${Date.now()}|${workerName} checkout ready...`)
                                                    console.log(`${Date.now()}|${workerName} checkout ready...`)

                                                        const creditCard  = await page.$('#paycreditcard')
                                                        await creditCard.click()

                                                        const shipping  = await page.$('#shipupsexpresscreditcard_55')
                                                        await shipping.click()

                                                        await page.$eval('#conditions', check => check.checked = true)
                                                        
                                                        await Promise.all([
                                                            page.$eval(`form[id="checkoutForm"]`, form => form.submit()),
                                                            page.waitForNavigation('domcontentloaded')
                                                        ])

                                                        await page.waitForSelector(`#checkout_submit`, { timeout: 100000 })
                                                        
                                                        await page.click(`#checkout_submit`, {delay: 100})

                                                        logger.log(`${Date.now()}|${workerName} at final page...`)
                                                        console.log(`${Date.now()}|${workerName} at final page...`)
                                                        await page.waitForTimeout(5000000)

                                                    break;
                                                } catch (error) {
                                                    console.log('Captcha not found...')
                                                    try {
                                                        await page.waitForSelector('.section-box-hd.head', {timeout: 500})
                                                        console.log('Checkout ready...')

                                                        logger.log(`${Date.now()}|${workerName} checkout ready...`)
                                                        console.log(`${Date.now()}|${workerName} checkout ready...`)
                                                       
                                                        const creditCard  = await page.$('#paycreditcard')
                                                        await creditCard.click()

                                                        const shipping  = await page.$('#shipupsexpresscreditcard_55')
                                                        await shipping.click()

                                                        await page.$eval('#conditions', check => check.checked = true)
                                                        
                                                        await Promise.all([
                                                            page.$eval(`form[id="checkoutForm"]`, form => form.submit()),
                                                            page.waitForNavigation('domcontentloaded')
                                                        ])

                                                        await page.waitForSelector(`#checkout_submit`, { timeout: 100000 })
                                                        

                                                        await page.click(`#checkout_submit`, {delay: 100})

                                                        logger.log(`${Date.now()}|${workerName} at final page...`)
                                                        console.log(`${Date.now()}|${workerName} at final page...`)
                                                        
                                                        await page.waitForTimeout(5000000)

                                                        break;
                                                    } catch (error) {
                                                        logger.log(`${Date.now()}|${workerName} error during checkout...`)
                                                        console.log(`${Date.now()}|${workerName} error during checkout...`)
                                                    }
                                                }
                                            }
                                            await page.waitForTimeout(100000)
                                            break
                                        } catch (error) {
                                            logger.log(`${Date.now()}|${workerName} error during checkout...`)
                                            console.log(`${Date.now()}|${workerName} error during checkout...`)
                                        }
                                    }
                                      
                                    execTimer.stop()
                                } catch (error) {
                                    logger.log(`${Date.now()}|${workerName} error during checkout...`)
                                    console.log(`${Date.now()}|${workerName} error during checkout...`)
                                }
                            })
                } else {
                    logger.log(`${Date.now()}|${workerName} failed to login. Please check proxy...`)
                    console.log(`${Date.now()}|${workerName} failed to login. Please check proxy...`)
                }
        
            } catch (error) {
                logger.log(`${Date.now()}|${workerName} ${error}`)
                console.log(`${Date.now()}|${workerName} ${error}`)
            }
        }
    })
    cb(pubsub)
}