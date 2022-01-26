import { Console } from 'console'
import fs from "fs"

const logger = new Console({
    stdout: fs.createWriteStream("log.txt")
})

export default logger