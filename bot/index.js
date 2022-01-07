const storeUrl = `https://www.notebooksbilliger.de/`
import { monitorAPI } from './libs/monitorAPI'
import puppeteer from 'puppeteer'

monitorAPI(async function(found) {

    console.log("product found start add to cart and checkout task...")

    const browser = await puppeteer.launch({
        headless: false,
    })

    const page = await browser.newPage()
    await page.goto(storeUrl)
    await page.waitForTimeout(500000)
    
})