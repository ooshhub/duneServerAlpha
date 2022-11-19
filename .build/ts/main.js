import { open } from "fs/promises";
import process, { stdin, stdout } from "process";
import readLine from "readline/promises";
var LogStates;
(function (LogStates) {
    LogStates["INIT"] = "init";
    LogStates["IDLE"] = "idle";
    LogStates["BUSY"] = "busy";
    LogStates["ERROR"] = "error";
})(LogStates || (LogStates = {}));
var LogTypes;
(function (LogTypes) {
    LogTypes["WARN"] = "WARN ";
    LogTypes["ERROR"] = "ERROR";
    LogTypes["LOG"] = "LOG  ";
    LogTypes["INFO"] = "INFO ";
    LogTypes["DEBUG"] = "DEBUG";
})(LogTypes || (LogTypes = {}));
class Logger {
    #log = null;
    #logState = LogStates.INIT;
    #logQueue = [];
    name;
    #debug = true;
    constructor(loggerName) {
        this.name = loggerName;
    }
    async #findOrCreateLogFile(filename = 'cunt.log') {
        if (this.#log)
            throw new Error(`Log has already been initialised`);
        this.#log = await open(`./${filename}`, 'a+')
            .catch(err => { throw err; });
        this.#logState = LogStates.IDLE;
    }
    async #processQueue() {
        if (!this.#log || this.#logState === LogStates.ERROR)
            throw new Error(`Log is busted.`);
        this.#logState = LogStates.BUSY;
        while (this.#logQueue.length > 0) {
            const msg = this.#logQueue.shift();
            if (msg)
                await this.#log.write(msg);
        }
        this.#logState = LogStates.IDLE;
    }
    async #writeLog(msg, logType) {
        if ([LogStates.ERROR, LogStates.INIT].includes(this.#logState))
            throw new Error('FUCK');
        const timestamp = new Date(Date.now()).toLocaleString(), message = `[${timestamp}] ${this.name}.${logType} - ${msg}\n`;
        this.#logQueue.push(message);
        if (this.#logState === LogStates.IDLE)
            this.#processQueue();
    }
    async destroy() {
        await new Promise(res => { setTimeout(() => res(), 10); });
        await this.#log?.close();
    }
    async init() {
        await this.#findOrCreateLogFile();
    }
    async log(msg) { this.#writeLog(msg, LogTypes.LOG); }
    async warn(msg) { this.#writeLog(msg, LogTypes.WARN); }
    async info(msg) { this.#writeLog(msg, LogTypes.INFO); }
    async error(msg) { this.#writeLog(msg, LogTypes.ERROR); }
    async debug(msg) {
        if (!this.#debug)
            return;
        this.#writeLog(msg, LogTypes.DEBUG);
    }
}
(async () => {
    const logger = new Logger('CuntyLogger');
    await logger.init();
    const exitServer = () => {
        logger?.destroy();
        process.exit();
    };
    const stdInReader = readLine.createInterface({
        input: stdin,
        output: stdout,
    });
    stdInReader.on('line', async (message) => {
        console.log(`"${message}"`);
        if (/ping/.test(message)) {
            process.stdout.write('fugoffcunt');
        }
        await logger.log(message);
    });
    await logger.warn('Fucking shit eh');
    let x = 0;
    setInterval(() => {
        console.log(`...${x}`);
        x++;
    }, 10000);
})();
