const storeUrl = `https://www.notebooksbilliger.de/`
const monitorAPI = require('./libs/monitorAPI')

monitorAPI(function(found) {
    console.log("product found start add to cart and checkout task...")
})