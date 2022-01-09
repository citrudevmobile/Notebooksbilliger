const storeUrl = `https://www.notebooksbilliger.de/`
import monitorAPI  from './libs/monitorAPI.js'
import puppeteer from 'puppeteer'
import executionTime from 'execution-time'
import randUserAgent from 'random-useragent'

let execTimer = executionTime(console.log)
//uc-btn-accept-banner

monitorAPI(async function(found) {
   
    console.log("product found start add to cart and checkout task...")

    console.log(found)

    let browser = null
    let proxyServer = 'http://basic.dreamproxies.io:31112'
    
    try {
        browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            executablePath: `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`,
            args:['--start-maximized', `--proxy-server=${proxyServer}`],
        })
    } catch (error) {
        try {
            browser = await puppeteer.launch({
                headless: false,
                defaultViewport: null,
                args:['--start-maximized', `--proxy-server=${proxyServer}`],
            })
        } catch (error) {
            console.log(error)
        }
    }
   
    const page = (await browser.pages())[0]

    await page.authenticate({
        username: 'yzor1c6scv',
        password: 'Bj9VYo37X7JbdEOs_country-Germany',
    })

    await page.setUserAgent(randUserAgent.getRandom())

    execTimer.start()
    await page.goto(storeUrl, {waitUntil: 'networkidle0'})

    execTimer.stop()
    await page.waitForTimeout(500000)
    
})