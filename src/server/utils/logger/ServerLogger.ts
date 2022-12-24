// Unsure about this one

import { ERROR } from "../../errors/errors";
import { ConsoleLoggingContract } from "../../serviceProviderRegistry/contracts/ConsoleLoggingContract";
import { FileLoggingService } from "./FileLogger";
import { InterfaceMessagingService } from "./InterfaceMessagingService";

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
	fileLogger: new FileLoggingService('DuneServerLog'),
	interfaceMessaging: new InterfaceMessagingService,
	consoleLogger: console
}

export class ServerLogger {

	static instance: ServerLogger | undefined;

	#fileLogger: FileLoggingService;
	#interfaceMessaging: InterfaceMessagingService;
	#consoleLogger: ConsoleLoggingContract;

	constructor(fileLogger?: FileLoggingService, interfaceLogger?: InterfaceMessagingService, consoleLoggger?: ConsoleLoggingContract) {
		this.#fileLogger = fileLogger ?? defaultLoggers.fileLogger;
		this.#interfaceMessaging = interfaceLogger ?? defaultLoggers.interfaceMessaging;
		this.#consoleLogger = consoleLoggger ?? defaultLoggers.consoleLogger;
		if (ServerLogger.instance) {
			console.warn(ERROR.ONLY_ONE_INSTANCE_ALLOWED, [ this.constructor.name ]);
			return ServerLogger.instance;
		}
		ServerLogger.instance = this;
	}

	#logToConsole(logLevel: LogLevel, messages: any[]): void {
		if (this.#consoleLogger[logLevel]) this.#consoleLogger[logLevel](messages);
	}

	#logToFile(logLevel: LogLevel, messages: any[]): void {
		this.#fileLogger.writeToLogFile(logLevel, messages, );
	}

	#logToInterface(logLevel: LogLevel, messages: any[]): void {
		this.#interfaceMessaging.sendLogToInterface(logLevel, messages);
	}

	#splitLogType = (inputString: string): string[] => {
		return inputString.split(',');
	}

	#determineType(arg1: LogType | any, ...args: any[]): GenericJson {
		const output = { type:<LogType> LogType.C, messages:<any[]> [] };
		if (arg1 in LogType) {
			output.type = arg1,
			output.messages = args
		}
		else {
			output.messages = [ arg1, ...args ];
		}
		return output;
	}

	#createLog(logLevel: LogLevel, ...args: any[]): void {
		const { type, messages } = this.#determineType(args);
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