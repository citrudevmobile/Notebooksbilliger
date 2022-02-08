import { Console } from "console";
import fs from "fs";

const date = new Date();

const logger = new Console({

    stdout: fs.createWriteStream(
        `log_${date.toLocaleString("hu-hu").replace(/\.| |:/g, "")}.txt`
    ),
});

export default logger; 
