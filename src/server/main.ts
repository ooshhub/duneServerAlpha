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

enum LogTypes {
	WARN 	= 'WARN ',
	ERROR = 'ERROR',
	LOG		= 'LOG  ',
	INFO	= 'INFO ',
	DEBUG	= 'DEBUG'
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

	async #writeLog(msg: string, logType: LogTypes): Promise<void> {
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

	async log(msg: string): Promise<void> {	this.#writeLog(msg, LogTypes.LOG); }
	async warn(msg: string): Promise<void> {	this.#writeLog(msg, LogTypes.WARN); }
	async info(msg: string): Promise<void> {	this.#writeLog(msg, LogTypes.INFO); }
	async error(msg: string): Promise<void> {	this.#writeLog(msg, LogTypes.ERROR); }
	async debug(msg: string): Promise<void> {
		if (!this.#debug) return;
		this.#writeLog(msg, LogTypes.DEBUG);
	}

}

const serverCommands = (() => {

	const STATUS_MARKER = `%STATUS%`;

	const echo = (inputString: string) => {
		const output = inputString.replace(/^%\w+%/, '');
		process.stdout.write(`${STATUS_MARKER}${output}`);
	}

	const pong = () => {
		process.stdout.write(`${STATUS_MARKER}pong`);
	}

	const log = (message: string) => {
		message = message.replace(/^\s*%\w+%/, '');
		logger.log(message);
	}

	return { echo, pong, log }

})();

const logger = new Logger('CuntyLogger');


const mockServer = (async () => {

	await logger.init();

	const STATUS_MARKER = `%STATUS%`;

	const COMMANDS: { [key: string]: (message: string) => void } = {
		"ECHO": serverCommands.echo,
		'PING': serverCommands.pong,
		'LOG':	serverCommands.log
	}

	const exitServer = () => {
		logger?.destroy();
		process.exit();
	}

	const stdInReader = readLine.createInterface({
		input: stdin,
		output: stdout,
	});
	stdInReader.on('line', async (message) => {
		message = message.trim();
		const isCommand = message.match(/^%(\w+)%/);
		if (isCommand) {
			const command = `${isCommand[1]}`;
			if (Reflect.has(COMMANDS, command)) {
				COMMANDS[command](message);
				return;
			}
		}
		else process.stdout.write(`Server knows not this command.`);
	});

	await logger.warn('Fucking shit eh');
	process.stdout.write(`${STATUS_MARKER}Server is online`);
	
});

await mockServer();