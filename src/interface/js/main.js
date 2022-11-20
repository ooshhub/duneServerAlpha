/* globals NL_MODE, Neutralino, NL_VERSION, NL_CVERSION, NL_OS */

import { ServerLog } from './ServerLog.js';

const { Pue } = await import('./pue.js');

/**
 * Constant land
 */
const SERVER_BUILD 			= `./build/ts/main.js`,
	INTERFACE_VERSION     = `0.1.0`,
	SERVER_STATUS_MARK		= `%STATUS%`,
	SERVER_LOG_SELECTOR		= '#server-log';


const serverLog = new ServerLog(document.querySelector(SERVER_LOG_SELECTOR), SERVER_STATUS_MARK);

/**
 * Neutralino startup
 */
const neutralinoApp = (async () => {

	const initNeutralino = () => {
		Neutralino.init();
		if(NL_OS != "Darwin") { setTray(); }
	}
	function onWindowClose() { Neutralino.app.exit(); }
	function setTray() {
			if(NL_MODE != "window") {
					console.log("INFO: Tray menu is only available in the window mode.");
					return;
			}
			let tray = {
					icon: "/src/interface/icons/trayIcon.png",
					menuItems: [
							{id: "VERSION", text: "Get version"},
							{id: "SEP", text: "-"},
							{id: "QUIT", text: "Quit"}
					]
			};
			Neutralino.os.setTray(tray);
	}
	function onTrayMenuItemClicked(event) {
		switch(event.detail.id) {
				case "VERSION":
						Neutralino.os.showMessageBox("Version information",
								`Neutralinojs server: v${NL_VERSION} | Neutralinojs client: v${NL_CVERSION}`);
						break;
				case "QUIT":
						Neutralino.app.exit();
						break;
		}
	}

	initNeutralino();
	Neutralino.events.on("trayMenuItemClicked", onTrayMenuItemClicked);
	Neutralino.events.on("windowClose", onWindowClose);

	return {}

})();

/**
 * Server functions
 */
const serverFunctions = (() => {

	const server = { };

	const spawnServer = async () => {
		const existingProcesses = await Neutralino.os.getSpawnedProcesses();
		if (existingProcesses.length) {
			console.log(`Killing ${existingProcesses.length} current processes...`);
			await destroyAllServers();
			console.info(`Removed processes, server is: `, server);
		}
		Object.assign(server, await Neutralino.os.spawnProcess(`node ${SERVER_BUILD}`));
		console.info(server);
		startServerListeners();
	}
	const startServerListeners = () => {
		Neutralino.events.on('spawnedProcess', (event) => {
			if (server.id === event.detail.id) {
				switch(event.detail.action) {
					case 'stdOut': {
						handleServerOut(event);
						break;
					}
					case 'stdErr': {
						handleServerErr(event);
						break;
					}
					case 'exit': {
						handleServerExit(event);
						break
					}
					default: {
						console.warn(`Unknown server event`, event);
					}
				}
			}
		});
		pingPong();
	}
	
	const handleServerExit = async () => {
		destroyAllServers();
		serverLog.receivedStdOut(`Server was destroyed. You monster.`);
	}

	const handleServerOut = (event) => {
		const msg = event.detail.data;
		serverLog.receivedStdOut(msg);
	}
	const handleServerErr = (event) => {
		console.info(event);
	}

	const destroyAllServers = async (id) => {
		const activeProcesses = await Neutralino.os.getSpawnedProcesses();
		for (let i = 0; i < activeProcesses.length; i++) {
			await Neutralino.os.updateSpawnedProcess(id, 'exit');
		}
	}

	const commandsEnum = {
		ping: `%PING%`,
		log:	`%LOG%`,
		echo: `%ECHO%`,
	}
	const sendMessageToServer = async (message, command) => {
		const commandString = command && commandsEnum[command] ? commandsEnum[command] : '';
		let updated = true;
		await Neutralino.os.updateSpawnedProcess(server.id, 'stdIn', `${commandString}${message}\n`)
			.catch(err => {
				updated = false;
				console.warn(err);
			});
		return updated;
	}

	const handleStartServerClick = () => {
		spawnServer();
	}

	const echoServer = (string) => {
		serverFunctions.sendMessageToServer('fuckuuuuu', 'echo');
	}

	return { handleStartServerClick, sendMessageToServer, destroyAllServers, echoServer }

})();



const initHtmlHandlers = (async () => {
	document.querySelector('#start-server')?.addEventListener('click', serverFunctions.handleStartServerClick);
	document.querySelector('#kill-server')?.addEventListener('click', serverFunctions.destroyAllServers);
	document.querySelector('#echo-server')?.addEventListener('click', serverFunctions.echoServer);
})();

const pingPong = async () => {
	await Helpers.timeout(8000);
	serverFunctions.sendMessageToServer('cunt', 'ping');
};

class Helpers {

	static async timeout(ms) {
		return new Promise(res => setTimeout(() => res(), ms));
	}
}
