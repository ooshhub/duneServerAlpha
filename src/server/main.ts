import { open } from "fs/promises";
import { FileHandle } from "fs/promises";
import process, { stdin, stdout } from "process";
import readLine from "readline/promises";

enum LogStates {
	INIT	= 'init',
	IDLE 	= 'idle',
	BUSY 	= 'busy',
	ERROR = 'error',
}

class Logger {

	#log: FileHandle|null = null;
	#logState:LogStates = LogStates.INIT;

	#logQueue:string[] = [];

	name: string;
	#debug = true;

	constructor(loggerName: string) {
		this.name = loggerName;
	}

	async #findOrCreateLogFile(filename = 'cunt.log'): Promise<void> {
		if (this.#log) throw new Error(`Log has already been initialised`);
		this.#log = await open(`./${filename}`, 'a+')
			.catch(err => { throw err; });
		this.#logState = LogStates.IDLE;
	}

	async #processQueue(): Promise<void> {
		if (!this.#log || this.#logState === LogStates.ERROR) throw new Error(`Log is busted.`);
		this.#logState = LogStates.BUSY;
		while (this.#logQueue.length > 0) {
			const msg = this.#logQueue.shift();
			if (msg) await this.#log.write(msg);
		}
		this.#logState = LogStates.IDLE;
	}

	async #writeLog(msg: string, logType: string): Promise<void> {
		if ([ LogStates.ERROR, LogStates.INIT ].includes(this.#logState)) throw new Error('FUCK');
		const timestamp = new Date(Date.now()).toLocaleString(),
			message = `[${timestamp}] ${this.name}.${logType} - ${msg}\n`;
		this.#logQueue.push(message);
		if (this.#logState === LogStates.IDLE) this.#processQueue();
	}

	async destroy(): Promise<void> {
		await new Promise<void>(res => { setTimeout(() => res(), 10) });
		await this.#log?.close();
	}

	async init(): Promise<void> {
		await this.#findOrCreateLogFile();
	}

	async log(msg: string): Promise<void> {	this.#writeLog(msg, 'LOG'); }
	async warn(msg: string): Promise<void> {	this.#writeLog(msg, 'WARNING'); }
	async info(msg: string): Promise<void> {	this.#writeLog(msg, 'INFO'); }
	async error(msg: string): Promise<void> {	this.#writeLog(msg, 'ERROR'); }
	async debug(msg: string): Promise<void> {
		if (!this.#debug) return;
		this.#writeLog(msg, 'DEBUG');
	}

}

(async () => {

	const logger = new Logger('CuntyLogger');
	await logger.init();

	const exitServer = () => {
		logger?.destroy();
		process.exit();
	}

	const stdInReader = readLine.createInterface({
		input: stdin,
		output: stdout,
	});
	stdInReader.on('line', (message) => {
		logger.log(message);
	});

	// const listenStdIn = () => {
	// 	process.stdin
	// 		.on('data', data => {
	// 			//do things
	// 		})
	// 		.on('end', () => {
	// 			// do more things
	// 		});
	// }

	await logger.warn('Fucking shit eh');

	let x = 0;
	setInterval(() => {
		console.log(`...${x}`);
		x++;
	}, 10000);
	
})();