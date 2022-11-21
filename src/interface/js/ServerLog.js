export class ServerLog {

  #serverLogElement;
  #serverStatusMarker;
	#serverMessageStyle ='background: purple; color: white; padding:1px 5px 1px 5px; border-radius: 3px; ';

  constructor(serverLogElement, serverStatusMarker) {
    this.#serverLogElement = serverLogElement;
    this.#serverStatusMarker = serverStatusMarker;
  }

	async #writeToServerLog(message) {
		message = message.replace(this.#serverStatusMarker, '');
		const newLine = document.createElement('div');
		newLine.classList.add(`server-log-line`);
		newLine.innerText = message;
		this.#serverLogElement.append(newLine);
		const scrollDistance = this.#serverLogElement.scrollHeight - (this.#serverLogElement.scrollTop + this.#serverLogElement.offsetHeight);
		if (scrollDistance < 150) {
			this.#serverLogElement.scrollTop = this.#serverLogElement.scrollHeight;
		}
	}

	async receivedStdOut(string, internalMessage = false) {
		if (internalMessage === true || /^\s*%STATUS%/.test(string)) this.#writeToServerLog(string);
		else {
			let output = string;
			if (/\s*"\s*(\{|\[)/.test(string)) {
				try { output = JSON.parse(string) }
				catch(e) { /* */ }
			}
			console.log(`%cServer:`, this.#serverMessageStyle, output);
		}
	}

}
