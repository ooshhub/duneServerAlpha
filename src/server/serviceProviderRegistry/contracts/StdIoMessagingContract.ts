import { InterfaceMessageType } from "../../io/InterfaceMessagingService.js";
import { LogLevel } from "../../utils/logger/ServerLogger.js";

export enum StdInCommands {
	
}

export type StdIoMessengerConfig = {
	autoInitialiseListeners: boolean,
}

export interface StdIoMessagingContract {

	sendLogToInterface: (logLevel: LogLevel, messages: any[]) => Promise<void>;
	
	// processStdInCommand: (handler: (command: StdInCommands, ...args: []) => void) => void;

	addObserver(observer: GenericFunction, messageType: InterfaceMessageType): boolean
}