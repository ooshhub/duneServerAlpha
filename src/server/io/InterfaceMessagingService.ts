import readLine from "readline/promises";
import { StdIoMessagingContract, StdIoMessengerConfig } from "../serviceProviderRegistry/contracts/StdIoMessagingContract.js";
import { Helpers } from "../utils/Helpers.js";
import { LogLevel } from "../utils/logger/ServerLogger.js";

enum InterfaceLogMarkers {
	log = '%LOG%',
	info = '%INFO%',
	warn = '%WARN%',
	error = '%ERROR'
}

export enum InterfaceMessageType {
	COMMAND = 'COMMAND'
}

const RX_SERVER_COMMAND = /%COMMAND:(\w+)%/

export class InterfaceMessagingService implements StdIoMessagingContract {

	#commandObservers: GenericFunction[] = [];
	#stdInInterface;

	constructor(messengerConfig: StdIoMessengerConfig) {
		this.#stdInInterface = readLine.createInterface({
			input: process.stdin,
			output: process.stdout,
		});
		if (messengerConfig.autoInitialiseListeners) this.initialiseListeners();
	}

	#isCommand(inputLine: string): string|null {
		const commandMatch = inputLine.match(RX_SERVER_COMMAND);
		return commandMatch?.[1] ?? null;
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

	async sendLogToInterface(logLevel: LogLevel, messages: any[]): Promise<void> {
		if (!InterfaceLogMarkers[logLevel]) return;
		messages.forEach(msg => {
			const sendString = `${InterfaceLogMarkers[logLevel]}${Helpers.stringifyMixed(msg)}`;
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