const { Console } = require("console")
const fs = require("fs")

const logger = new Console({
    stdout: fs.createWriteStream("../log/default.log.txt")
})

export default function () {

    return logger

}