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
           // `--proxy-server=${data.proxyServer}`,
            try {
                browser = await puppeteer.launch({
                    headless: false,
                    defaultViewport: null,
                    executablePath: `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`,
                    args:['--start-maximized',],
                })
            } catch (error) {
                try {//`--blink-settings=imagesEnabled=false`
                    //`--proxy-server=${data.proxyServer}`,
                    browser = await puppeteer.launch({
                        headless: false,
                        defaultViewport: null,
                        args:['--start-maximized',  ],
                    })
                } catch (error) {
                    console.log(error)
                }
            }
        
            try {
            
                const page = (await browser.pages())[0]
                /*
                await page.authenticate({
                    username: data.proxyUser,
                    password: data.proxyPassword,
                })
                */

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
                        console.log(`${workerName} retry login...`)
                        console.log(`${workerName} ${error}`)
                        
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
                                            
                                            console.log('Added product to cart...')
                                           
                                            await page.goto('https://www.notebooksbilliger.de/kasse', { waitUntil: 'domcontentloaded', timeout: 50000 })
                                            
                                            while (true) {
                                                try {
                                                    await page.waitForXPath("//button[contains(., 'Click to start verification')]", {timeout: 500})
                                                    console.log('Captcha found...')
                                                    await page.waitForTimeout(5000000)
                                                    const [button] = await page.$x("//button[contains(., 'Click to start verification')]");
                                                    if (button) {
                                                        await button.click();
                                                    }
                                                    await page.waitForSelector('.section-box-hd.head', {timeout: 100000})
                                                    console.log('Checkout ready...')

                                                        const creditCard  = await page.$('#paycreditcard')
                                                        await creditCard.click()

                                                        const shipping  = await page.$('#shipupsexpresscreditcard_55')
                                                        await shipping.click()

                                                        await page.$eval('#conditions', check => check.checked = true)
                                                        
                                                        await Promise.all([
                                                            page.$eval(`form[id="checkoutForm"]`, form => form.submit()),
                                                            page.waitForNavigation('domcontentloaded')
                                                        ])

                                                        await page.waitForSelector(`form[name="checkout_summary_form"]`, { timeout: 100000 })
                                                        console.log('At final page...')
                                                        await page.waitForTimeout(5000000)

                                                        await Promise.all([
                                                            page.$eval(`form[name="checkout_summary_form"]`, form => form.submit()),
                                                            page.waitForNavigation('domcontentloaded')
                                                        ])

                                                    break;
                                                } catch (error) {
                                                    console.log('Captcha not found...')
                                                    try {
                                                        await page.waitForSelector('.section-box-hd.head', {timeout: 500})
                                                        console.log('Checkout ready...')
                                                       
                                                        const creditCard  = await page.$('#paycreditcard')
                                                        await creditCard.click()

                                                        const shipping  = await page.$('#shipupsexpresscreditcard_55')
                                                        await shipping.click()

                                                        await page.$eval('#conditions', check => check.checked = true)
                                                        
                                                        await Promise.all([
                                                            page.$eval(`form[id="checkoutForm"]`, form => form.submit()),
                                                            page.waitForNavigation('domcontentloaded')
                                                        ])

                                                        await page.waitForSelector(`form[name="checkout_summary_form"]`, { timeout: 100000 })
                                                        console.log('At final page...')
                                                        await page.waitForTimeout(5000000)

                                                        await Promise.all([
                                                            page.$eval(`form[name="checkout_summary_form"]`, form => form.submit()),
                                                            page.waitForNavigation('domcontentloaded')
                                                        ])

                                                        break;
                                                    } catch (error) {
                                                        console.log(error)
                                                        console.log('Error during checkout')
                                                    }
                                                }
                                            }
                                            await page.waitForTimeout(100000)
                                            break
                                        } catch (error) {
                                            console.log(`${data.workerName}: error occured during checkout process trying again...`)
                                        }
                                    }
                                      
                                    execTimer.stop()
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