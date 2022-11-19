/* globals NL_MODE, Neutralino, NL_VERSION, NL_CVERSION, NL_OS */

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

function onWindowClose() {
    Neutralino.app.exit();
}

Neutralino.init();

Neutralino.events.on("trayMenuItemClicked", onTrayMenuItemClicked);
Neutralino.events.on("windowClose", onWindowClose);

if(NL_OS != "Darwin") { // TODO: Fix https://github.com/neutralinojs/neutralinojs/issues/615
    setTray();
}

const timeout = async (ms) => new Promise(res => setTimeout(() => res(), ms));

document.querySelector('#start-server')?.addEventListener('click', async () => {
  const spawn = await Neutralino.os.spawnProcess('node ./src/server/tsBuild/main.js');

  Neutralino.events.on('spawnedProcess', (event) => {
    console.log(event);
    // if (spawn.id === event.detail.id) {
  });

  console.log(spawn.id, spawn.pid);

  await timeout(2500);

  await Neutralino.os.updateSpawnedProcess(spawn.id, 'stdIn', 'flaps\n');

  await timeout(2500);

  await Neutralino.os.updateSpawnedProcess(spawn.id, 'stdIn', 'ping');

});
