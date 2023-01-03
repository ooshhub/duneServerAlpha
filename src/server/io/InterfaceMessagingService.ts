import readLine from "readline/promises";
import { StdIoMessagingContract, StdIoMessengerConfig } from "../serviceProviderRegistry/contracts/StdIoMessagingContract.js";
import { Helpers } from "../utils/Helpers.js";
import { LogLevel } from "../utils/logger/ServerLogger.js";

enum InterfaceLogMarkers {
	log = 'LOG',
	info = 'INFO',
	warn = 'WARN',
	error = 'ERROR',
}

export enum InterfaceMessageType {
	COMMAND = 'COMMAND'
}

export class InterfaceMessagingService implements StdIoMessagingContract {

	#commandObservers: GenericFunction[] = [];
	#stdInInterface;

	#rxServerCommand = /^%[\w_-]+%/;

	constructor(messengerConfig: StdIoMessengerConfig) {
		this.#stdInInterface = readLine.createInterface({
			input: process.stdin,
			output: process.stdout,
		});
		if (messengerConfig.autoInitialiseListeners) this.initialiseListeners();
	}

	#isCommand(inputLine: string): boolean {
		return this.#rxServerCommand.test(inputLine);
	}

	initialiseListeners() {
		this.#stdInInterface.on('line', async (message) => {
			message = message.trim();
			if (this.#isCommand(message)) {
				this.#commandObservers.forEach(observer => observer(message));
			}
			// Implement more message types as required
		});
	}

	// Send a message for the ServerInterface to log to the UI
	// Currently doesn't implement log levels
	async sendLogToInterface(logLevel: LogLevel, messages: any[]): Promise<void> {
		if (!InterfaceLogMarkers[logLevel]) return;
		messages.forEach(msg => {
			const sendString = `%INTERFACE%${Helpers.stringifyMixed(msg)}\n`;
			process.stdout.write(sendString);
		});
	}

	#getTargetObserverArray(messageType: InterfaceMessageType): GenericFunction[] | null {
		return messageType === InterfaceMessageType.COMMAND
			? this.#commandObservers
			: null;
	}

	addObserver(observer: GenericFunction, messageType: InterfaceMessageType): boolean {
		const targetArray = this.#getTargetObserverArray(messageType);
		if (!targetArray || targetArray.includes(observer)) return false;
		else {
			this.#commandObservers.push(observer);
			return true;
		}
	}

	removeObserver(observer: GenericFunction,  messageType: InterfaceMessageType): boolean {
		const targetArray = this.#getTargetObserverArray(messageType);
		if (!targetArray || !targetArray.includes(observer)) return false;
		else {
			Helpers.filterInPlace(targetArray, v => v !== observer);
			return true;
		}
	}

}