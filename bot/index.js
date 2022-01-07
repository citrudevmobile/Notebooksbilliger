const storeUrl = `https://www.notebooksbilliger.de/`
const monitorAPI = require('./libs/monitorAPI')
const puppeteer = require('puppeteer-core')

monitorAPI(async function(found) {

    console.log("product found start add to cart and checkout task...")

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: 'c:\Program Files (x86)\Google\Chrome\Application\chrome.exe'
    })

    const page = await browser.newPage()
    await page.goto(storeUrl)
    await page.waitForTimeout(500000)

    
})