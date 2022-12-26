import { LogLevel } from "../../utils/logger/ServerLogger";

export enum StdInCommands {
	
}

export interface StdIoMessagingContract {

	sendLogToInterface: (logLevel: LogLevel, messages: any[]) => Promise<void>;
	
	processStdInCommand: (handler: (command: StdInCommands, ...args: []) => void) => void;

}