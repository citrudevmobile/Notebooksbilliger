const storeUrl = `https://www.notebooksbilliger.de/`
import monitorAPI  from './libs/monitorAPI.js'
import puppeteer from 'puppeteer'
import executionTime from 'execution-time'

let execTimer = executionTime(console.log)


monitorAPI(async function(found) {
   
    console.log("product found start add to cart and checkout task...")

    console.log(found)
    
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        executablePath: `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`,
        args:['--start-maximized' ]
    })

    const page = await browser.newPage()
    execTimer.start()
    await page.goto(storeUrl)
    execTimer.stop()
    await page.waitForTimeout(500000)
    
})