// Unsure about this one

import { ERROR } from "../../errors/errors.js";
import { ConsoleLoggingContract } from "../../serviceProviderRegistry/contracts/ConsoleLoggingContract.js";
import { ServerLoggerConfig, ServerLoggingContract } from "../../serviceProviderRegistry/contracts/ServerLoggingContract.js";
import { FileLoggingService } from "./FileLogger.js";
import { InterfaceMessagingService } from "../../io/InterfaceMessagingService.js";

export enum LogLevel {
	LOG = 'log',
	INFO = 'info',
	WARN = 'warn',
	ERROR = 'error'
}

export enum LogType {
	C = `console`,
	I = 'interface',
	F = 'file',
	CF = 'console,file',
	CI = 'console,interface',
	FI = 'file,interface',
	CFI = 'console,file,ui',
}

const defaultLoggers = {
	fileLogger: new FileLoggingService({ name: 'FileLogger', logName: 'cunt.log', autoInitialise: true }),
	consoleLogger: console
}

export class ServerLogger implements ServerLoggingContract {

	static instance: ServerLogger | undefined;

	#fileLogger: FileLoggingService;
	#interfaceMessaging?: InterfaceMessagingService;
	#consoleLogger: ConsoleLoggingContract;

	constructor(serverLoggerConfig: ServerLoggerConfig) {
		this.#fileLogger = serverLoggerConfig.fileLogger ?? defaultLoggers.fileLogger;
		this.#consoleLogger = serverLoggerConfig.consoleLoggger ?? defaultLoggers.consoleLogger;
		if (ServerLogger.instance) {
			console.warn(ERROR.ONLY_ONE_INSTANCE_ALLOWED, [ this.constructor.name ]);
			return ServerLogger.instance;
		}
		ServerLogger.instance = this;
	}

	registerInterfaceLogger(interfaceLogger: InterfaceMessagingService): void {
		this.#interfaceMessaging = interfaceLogger;
	}

	registerConsoleLogger(consoleLogger: ConsoleLoggingContract): void {
		this.#consoleLogger = consoleLogger;
	}

	registerFileLogger(fileLogger: FileLoggingService): void {
		this.#fileLogger = fileLogger;
	}


	#logToConsole(logLevel: LogLevel, messages: any[]): void {
		if (this.#consoleLogger[logLevel]) this.#consoleLogger[logLevel](...messages);
	}

	#logToFile(logLevel: LogLevel, messages: any[]): void {
		this.#fileLogger.writeToLogFile(logLevel, messages);
	}

	#logToInterface(logLevel: LogLevel, messages: any[]): void {
		if (this.#interfaceMessaging) this.#interfaceMessaging.sendLogToInterface(logLevel, messages);
	}

	#splitLogType = (inputString: string): string[] => {
		return inputString.split(',');
	}

	#determineType(...args: any[]): GenericJson {
		const arg1 = args.shift();
		const output = { type:<LogType> LogType.C, messages:<any[]> [] };
		if (Object.values(LogType).includes(arg1)) {
			output.type = arg1,
			output.messages = args
		}
		else {
			output.messages = [ arg1, ...args ];
		}
		return output;
	}

	#createLog(logLevel: LogLevel, ...args: any[]): void {
		const { type, messages } = this.#determineType(...args);
		if (!type) this.#logToConsole(logLevel, messages);
		const targets = this.#splitLogType(type);
		if (targets.includes('console')) this.#logToConsole(logLevel, messages);
		if (targets.includes('file')) this.#logToFile(logLevel, messages);
		if (targets.includes('interface')) this.#logToInterface(logLevel, messages);	
	}

	log(...args: any[]): void { this.#createLog(LogLevel.LOG, ...args); }
	info(...args: any[]): void { this.#createLog(LogLevel.INFO, ...args); }
	warn(...args: any[]): void { this.#createLog(LogLevel.WARN, ...args); }
	error(...args: any[]): void { this.#createLog(LogLevel.ERROR, ...args); }

}