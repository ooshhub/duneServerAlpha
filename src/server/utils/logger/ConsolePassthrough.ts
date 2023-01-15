import { ConsoleLoggingContract } from "../../serviceProviderRegistry/contracts/ConsoleLoggingContract.js";
import { LogLevel } from "./ServerLogger.js";

export class ConsolePassthrough implements ConsoleLoggingContract {

	async #sendConsoleMessagesToInterface(logLevel: string, messages: any[]): Promise<void> {
		const msgs = JSON.stringify(messages);
		const message = `%CONSOLE-${logLevel.toUpperCase()}%${msgs}`;
		process.stdout.write(`${message}\n`);
	}

	log(messages: any[]) {
		this.#sendConsoleMessagesToInterface(LogLevel.LOG, messages);
	}

	info(messages: any[]) {
		this.#sendConsoleMessagesToInterface(LogLevel.INFO, messages);
	}

	warn(messages: any[]) {
		this.#sendConsoleMessagesToInterface(LogLevel.WARN, messages);
	}

	error(messages: any[]) {
		this.#sendConsoleMessagesToInterface(LogLevel.ERROR, messages);
	}

}