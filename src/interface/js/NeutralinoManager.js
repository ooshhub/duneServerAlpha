/* globals NL_MODE, Neutralino, NL_VERSION, NL_CVERSION, NL_OS */

import { runPatch } from "./NeutralinoDevPatch.js";

export const NeutralinoManager = (() => {

	const initNeutralino = (nlGlobals) => {
    if (nlGlobals) {
      runPatch(nlGlobals);
    }
    console.log('hello', window.NL_TOKEN);
    try {
      Neutralino.init();
      continueLoad();
      return true;
    }
    catch(e) {
      console.warn(e);
      return false;
    }
	}

  const continueLoad = () => {
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

    if(NL_OS != "Darwin") { setTray(); }
    Neutralino.events.on("trayMenuItemClicked", onTrayMenuItemClicked);
    Neutralino.events.on("windowClose", onWindowClose);
	}

	return {
    initNeutralino: initNeutralino
  }
})();