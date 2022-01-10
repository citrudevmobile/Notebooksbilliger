import PubSub from 'PubSub'
import puppeteer from 'puppeteer-extra'
import executionTime from 'execution-time'
import UserAgent from 'user-agents'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

const randUserAgent = new UserAgent({ deviceCategory: 'desktop' })
const pubsub = new PubSub();
const storeUrl = `https://www.notebooksbilliger.de/`
const loginPage = `https://www.notebooksbilliger.de/kundenkonto/anmelden/regis/register`

let execTimer = executionTime(console.log)
let foundProducts = {}
let workers = []

puppeteer.use(StealthPlugin())

export default function (cb) {

    pubsub.subscribe('start_worker', async (data) => {
        
        let workerName = data.workerName
        foundProducts[workerName] = null
        let browser = null
        let refresh = 0
        console.log(`Worker ${workerName} started`)
        
        if (!workers.includes(workerName)){
            workers.push(workerName)

            try {
                browser = await puppeteer.launch({
                    headless: false,
                    defaultViewport: null,
                    executablePath: `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`,
                    args:['--start-maximized', `--proxy-server=${data.proxyServer}`],
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
        
                execTimer.start()
                
                await page.goto(storeUrl, {waitUntil: 'networkidle0', timeout: 100000})
                await page.waitForSelector('#uc-btn-accept-banner', { timeout: 100000 })
                await page.click('#uc-btn-accept-banner', { delay: 300 })
                await page.goto(loginPage, {waitUntil: 'networkidle0', timeout: 100000})
                await page.waitForSelector('#f_email_address', { timeout: 100000 })
                await page.waitForSelector('#f_password', { timeout: 100000 })
                await page.type('#f_email_address', data.userEmail, {delay: 300})
                await page.type('#f_password', data.userPassword, {delay: 300})
                await page.click(`button[value="Weiter"]`, {delay: 300})
                await page.waitForSelector('#haccount',{ timeout: 100000 })
                execTimer.stop()
                console.log('okay loggedin')
    
                await pubsub.publish('ready_worker', {
                    workerName: workerName
                })

                while(foundProducts[workerName] == null) {
                    console.log('waiting for discovered product...')
                    if (refresh > 100) {
                        await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] })
                        await page.waitForSelector('#haccount',{ timeout: 100000 })
                        refresh = 0 
                    } else {
                        await page.waitForSelector('#haccount',{ timeout: 100000 })
                        await page.waitForTimeout(500)
                        refresh++
                    }
                }

        
            } catch (error) {
        
                console.log(error)
            }
        }
            
      
    })

    pubsub.subscribe('update_product_list', async (data) => {
        console.log('updated product list')
        let workerName = data.workerName
        foundProducts[workerName] = data.found
    })

    cb(pubsub)

}