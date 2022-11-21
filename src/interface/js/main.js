/* globals NL_MODE, Neutralino, NL_VERSION, NL_CVERSION, NL_OS */

import { ServerLog } from './ServerLog.js';
import { ServerInterface } from './ServerInterface.js';
import { ServerCommandLineInterface } from './ServerCommandLineInterface.js';

/**
 * Constant land
 */
const SERVER_BUILD 			= `./build/ts/main.js`,
	INTERFACE_VERSION     = `0.1.0`,
	SERVER_STATUS_MARK		= `%STATUS%`,
	SERVER_LOG_SELECTOR		= '#log-content',
	SERVER_CLI_ELEMENT		= `#log-text-input`;


const serverLog = new ServerLog(document.querySelector(SERVER_LOG_SELECTOR), SERVER_STATUS_MARK),
	serverInterface = new ServerInterface(serverLog, SERVER_BUILD),
	serverCommandLine = new ServerCommandLineInterface(serverInterface, serverLog, document.querySelector(SERVER_CLI_ELEMENT));

/**
 * Neutralino startup
 */
(async () => {

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
 * Initialise HTML handlers
 */
(async () => {
	document.querySelector('#start-server')?.addEventListener('click', serverInterface.handleStartServerClick);
	document.querySelector('#kill-server')?.addEventListener('click', () => serverInterface.destroyAllServers());
	document.querySelector('#echo-server')?.addEventListener('click', serverInterface.echoServer);
	document.querySelector('#version').innerText = `v${INTERFACE_VERSION}`;
})();
