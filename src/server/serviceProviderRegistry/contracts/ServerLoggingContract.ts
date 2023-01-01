import { FileLoggingService } from "../../utils/logger/FileLogger.js";
import { InterfaceMessagingService } from "../../io/InterfaceMessagingService.js";
import { ConsoleLoggingContract } from "./ConsoleLoggingContract.js";

export type ServerLoggerConfig = {
	fileLogger?: FileLoggingService,
	consoleLoggger?: ConsoleLoggingContract
}

export interface ServerLoggingContract {
	log: (...args: any[]) => void;
	info: (...args: any[]) => void;
	warn: (...args: any[]) => void;
	error: (...args: any[]) => void;

	registerInterfaceLogger: (interfaceLogger: InterfaceMessagingService) => void;

	registerConsoleLogger: (consoleLogger: ConsoleLoggingContract) => void;

}