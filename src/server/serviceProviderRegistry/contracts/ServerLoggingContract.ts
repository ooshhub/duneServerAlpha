import { FileLoggingService } from "../../utils/logger/FileLogger.js";
import { ConsoleLoggingContract } from "./ConsoleLoggingContract.js";
import { StdIoMessagingContract } from "./StdIoMessagingContract.js";

export type ServerLoggerConfig = {
	fileLogger?: FileLoggingService,
	consoleLogger?: ConsoleLoggingContract
}

export interface ServerLoggingContract {
	log: (...args: any[]) => void;
	info: (...args: any[]) => void;
	warn: (...args: any[]) => void;
	error: (...args: any[]) => void;

	registerInterfaceLogger: (interfaceLogger: StdIoMessagingContract) => void;

	registerConsoleLogger: (consoleLogger: ConsoleLoggingContract) => void;

}