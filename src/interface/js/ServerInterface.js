/* globals Neutralino */

export const COMMANDS = {
  ping: `%PING%`,
  log:	`%LOG%`,
  echo: `%ECHO%`,
}

export class ServerInterface {

  #server = {};
  #logger = null;

  #serverPath = '';

  constructor(serverLogger, serverFIlePath) {
    this.#logger = serverLogger;
    this.#serverPath = serverFIlePath;
    this.#startServerListeners();

  }

  async #spawnServer() {
    const existingProcesses = await Neutralino.os.getSpawnedProcesses();
    if (existingProcesses.length) {
      console.log(`Killing ${existingProcesses.length} current processes...`);
      await this.destroyAllServers();
      console.info(`Removed processes, server is: `, this.#server);
    }
    Object.assign(this.#server, await Neutralino.os.spawnProcess(`node ${this.#serverPath}`));
  }

  #startServerListeners() {
    Neutralino.events.on('spawnedProcess', (event) => {
      if (this.#server.id === event.detail.id) {
        switch(event.detail.action) {
          case 'stdOut': {
            this.#handleServerOut(event);
            break;
          }
          case 'stdErr': {
            this.#handleServerErr(event);
            break;
          }
          case 'exit': {
            this.#handleServerExit(event);
            break
          }
          default: {
            console.warn(`Unknown server event`, event);
          }
        }
      }
    });
  }
    
  async #handleServerExit() {
    this.destroyAllServers();
    this.#logger.receivedStdOut(`Server was destroyed. You monster.`);
  }
  
  async #handleServerOut(event) {
    const msg = event.detail.data;
    this.#logger.receivedStdOut(msg);
  }
  async #handleServerErr(event) {
    console.info(event);
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
    if (destroyed) this.#logger.receivedStdOut(`Server destroyed. You monster.`, true);
  }

  async sendMessageToServer(message, command) {
    if (!this.#server) return false;
    const commandString = command && COMMANDS[command] ? COMMANDS[command] : '';
    let updated = true;
    await Neutralino.os.updateSpawnedProcess(this.#server.id, 'stdIn', `${commandString}${message}\n`)
      .catch(err => {
        updated = false;
        console.warn(err);
      });
    return updated;
  }

  handleStartServerClick = () => {
    this.#spawnServer();
  }

  echoServer = () => {
    const echoInput = document.querySelector('#echo-text').value;
    if (echoInput) this.sendMessageToServer(echoInput, 'echo');
  }

}