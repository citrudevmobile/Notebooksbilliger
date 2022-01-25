import { Console } from 'console'
import fs from "fs"

const logger = new Console({
    stdout: fs.createWriteStream("../log/default.log.txt")
})

export default function () {

    return logger

}