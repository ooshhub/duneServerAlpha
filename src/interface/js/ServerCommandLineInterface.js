export class ServerCommandLineInterface {

	#serverInterface;
	#serverLog;
	#cliElement;

	constructor(serverInterface, serverLog, commandLineElement) {
		this.#serverInterface = serverInterface;
		this.#cliElement = commandLineElement;
		this.#serverLog = serverLog;
		this.#registerElementHandlers();
	}

	#registerElementHandlers() {
		if (!(this.#cliElement instanceof HTMLInputElement)) throw new Error('Invalid CLI input element.');
		this.#cliElement.addEventListener('keyup', event => {
			const { key } = event;
			if (key === 'Enter') this.#prepareInput();
			else if (key === 'Escape') this.#clearInput();
		});
	}

	#clearInput() {
		this.#cliElement.value = '';
	}

	async #prepareInput() {
		const parts = this.#cliElement.value.trim().match(/(\/)?(\w+)\s*(.*)/);
		if (parts?.length > 1 && parts[2]) {
			const isCommand = parts[1];
			let command, content;
			if (isCommand) {
				command = parts[2].toLowerCase();
				content = parts[3];
			}
			else {
				command = 'echo'
				content = parts.input ?? parts[0];
			}
			await this.#serverInterface.sendMessageToServer(content, command).then(resp => {
				if (!resp) this.#serverLog.receivedStdOut(`%STATUS%No server here, cunt.`);
			});
		}
		this.#clearInput();
	}

}