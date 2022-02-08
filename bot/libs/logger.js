import { Console } from "console";
import fs from "fs";

const logger = new Console({
    stdout: fs.createWriteStream(
        `log_${new Date(Date.now()).toLocaleString("en-US")}.txt`
    ),
});

export default logger;
