const storeUrl = `https://www.notebooksbilliger.de/`
const monitorAPI = require('./libs/monitorAPI')
const puppeteer = require('puppeteer')

monitorAPI(async function(found) {

    console.log("product found start add to cart and checkout task...")

    const browser = await puppeteer.launch({
        headless: false,
    })

    const page = await browser.pages[0]
    await page.goto(storeUrl)
    await page.waitForTimeout(500000)
    
})