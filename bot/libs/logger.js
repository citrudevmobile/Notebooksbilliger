import { Console } from 'console'
import fs from "fs"

const logger = new Console({
    stdout: fs.createWriteStream(`log_${(new Date().toJSON().slice(0,19))}.txt`)
})

export default logger
