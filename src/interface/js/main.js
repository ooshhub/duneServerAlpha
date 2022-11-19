/* globals NL_MODE, Neutralino, NL_VERSION, NL_CVERSION, NL_OS */


/**
 * Constant land
 */
const SERVER_BUILD 			= `./build/ts/main.js`,
	INTERFACE_VERSION = `0.1.0`;

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
			for (let i = 0; i < existingProcesses.length; i++) {
				await Neutralino.os.updateSpawnedProcess(existingProcesses[i].id, 'exit');
			}
		}
		Object.assign(server, await Neutralino.os.spawnProcess(`node ${SERVER_BUILD}`));
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
	}
	const handleServerExit = (event) => {
		console.info(event);
	}
	const handleServerOut = (event) => {
		const msg = event.detail.data;
		serverConsole.buildLine(msg);
	}
	const handleServerErr = (event) => {
		console.info(event);
	}

	const commandsEnum = {
		ping: `%PING%`,
		log:	`%LOG%`,
	}
	const sendMessageToServer = async (message, isCommand = false) => {
		message = isCommand ? (commandsEnum[message] ?? message) : message;
		let updated = true;
		await Neutralino.os.updateSpawnedProcess(server.id, 'stdIn', message)
			.catch(err => {
				updated = false;
				console.warn(err);
			});
		return updated;
	}

	const handleStartServerClick = () => {
		spawnServer();
	}

	return { handleStartServerClick, sendMessageToServer }

})();

const serverConsole = (() => {

	const serverConsoleSelector = '#server-log',
		serverConsoleElement = document.querySelector(serverConsoleSelector);

	const buildLine = (message) => {
		const newLine = document.createElement('div');
		newLine.classList.add(`server-log-line`);
		newLine.innerText = message;
		serverConsoleElement.append(newLine);
		const scrollDistance = serverConsoleElement.scrollHeight - (serverConsoleElement.scrollTop + serverConsoleElement.offsetHeight);
		if (scrollDistance < 150) {
			serverConsoleElement.scrollTop = serverConsoleElement.scrollHeight;
		}
	}

	return { buildLine }

})();

const initHtmlHandlers = (async () => {
	document.querySelector('#start-server')?.addEventListener('click', serverFunctions.handleStartServerClick);
})();

class Helpers {

	static async timeout(ms) {
		return new Promise(res => setTimeout(() => res(), ms));
	}

}