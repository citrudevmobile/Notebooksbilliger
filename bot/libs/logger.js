import { Console } from "console";
import fs from "fs";

const date = new Date();
const year = String(date.getFullYear()).padStart(2, "0");
const month = String(date.getMonth()).padStart(2, "0");
const day = String(date.getDay()).padStart(2, "0");
const hours = String(date.getHours()).padStart(2, "0");
const minutes = String(date.getMinutes()).padStart(2, "0");
const seconds = String(date.getSeconds()).padStart(2, "0");

const logger = new Console({
    // '`log_${new Date(Date.now()).toLocaleString("en-US")}.txt`;
    stdout: fs.createWriteStream(
        `log_${year}${month}${day}_${hours}${minutes}${seconds}.txt`
    ),
});

export default logger; 
