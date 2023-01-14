/* globals Neutralino */

import { InterfaceEvent } from "./InterfaceEvent.js";
import { ServerCommandInterpreter } from "./ServerCommandInterpreter.js";

export class ServerInterface {

	#server = {};
	#interpreter;
	#observer = null;

	#serverPath = '';

	constructor({ serverFilePath, observer }) {
		this.#serverPath = serverFilePath;
		this.#observer = observer;
		this.#interpreter = new ServerCommandInterpreter();
		this.#startServerListeners();
	}

	get online() { return !!this.#server.pid }

	sendEvent(interfaceEvent) {
		if (interfaceEvent.eventName) {
			this.#observer(interfaceEvent);
		}
	}

	async spawnServer(port) {
		const existingProcesses = await Neutralino.os.getSpawnedProcesses();
		if (existingProcesses.length) {
			console.log(`Killing ${existingProcesses.length} current processes...`);
			await this.destroyAllServers();
			console.info(`Removed processes, server is: `, this.#server);
		}
		Object.assign(this.#server, await Neutralino.os.spawnProcess(`node ${this.#serverPath} --PORT=${port}`));
		return this.online;
	}

	#splitLines({ detail }) {
		const { data } = detail
			? detail
			: null;
    if (data && typeof(data) !== 'string') console.log(`Irregular data recieved by splitLines in ServerInterface.js`, data);
		return data
      ? data.split(/\n/g).filter(v=>v)
			: [];
	}

	#startServerListeners() {
		Neutralino.events.on('spawnedProcess', (event) => {      
			if (this.#server.id === event.detail.id) {
				const messages = this.#splitLines(event);
				messages.forEach(message => {
					switch(event.detail.action) {
						case 'stdOut': {
							this.#handleServerOut(message);
							break;
						}
						case 'stdErr': {
							this.#handleServerErr(message);
							break;
						}
						case 'exit': {
							this.#handleServerExit(message);
							break
						}
						default: {
							console.warn(`Unknown server event`, event);
						}
					}
				});
			}
		});
	}
		
	async #handleServerExit() {
		this.sendEvent(new InterfaceEvent({
			eventName: 'EXIT',
			eventData: {}
		}));
	}
	
	async #handleServerOut(stdOutString) {
		const event = this.#interpreter.transformStdOut(stdOutString);
		if (event) this.sendEvent(event);
	}
	async #handleServerErr(stdErrString) {
		const event = this.#interpreter.transformStdErr(stdErrString);
		if (event) this.sendEvent(event);
	}

	async destroyAllServers(id) {
		let destroyed = 0;
		const ids = id
			? [ id ]
			: Object.values(await Neutralino.os.getSpawnedProcesses()).map(v => v.id);
		for (let i = 0; i < ids.length; i++) {
			await Neutralino.os.updateSpawnedProcess(ids[i], 'exit');
			destroyed++;
		}
		Object.assign(this.#server, { id: null, pid: null });
		if (destroyed) this.sendEvent('destroy', `Server destroyed. You monster.`);
	}

	async sendRequestToServer(request, requestData) {
		const commandString = this.#interpreter.buildServerCommand(request, requestData);
		let updated = true;
		await Neutralino.os.updateSpawnedProcess(this.#server.id, 'stdIn', `${commandString}\n`)
			.catch(err => {
				updated = false;
				console.warn(err);
			});
		return updated;
	}

	echoServer(echoString) {
		this.sendCommandToServer('ECHO', echoString);
	}

	async restartServer() {
		console.warn('Not yet implemented');
		return false;
	}

}