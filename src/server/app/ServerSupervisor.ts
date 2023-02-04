import { ConfigKeys } from "../config/ConfigKeyTypes.js";
import { EnvironmentKeys } from "../config/EnvironmentKeyTypes.js";
import { DuneError } from "../errors/DuneError.js";
import { ERROR } from "../errors/errors.js";
import { StdIoRequests, StdIoResponseMapping } from "../events/mapping/StdIoEventMapping.js";
import { InterfaceMessagingInterpreter } from "../io/InterfaceMessagingInterpreter.js";
import { InterfaceMessageType } from "../io/InterfaceMessagingService.js";
import { PlayerLinkContract } from "../serviceProviderRegistry/contracts/PlayerLinkContract.js";
import { StdIoMessagingContract } from "../serviceProviderRegistry/contracts/StdIoMessagingContract.js";
import { LogType } from "../utils/logger/ServerLogger.js";
import { CommandLineOptionCollection } from "./ConfigManager.js";

export type ServerSupervisorConfig = {
  interfaceMessagingService: StdIoMessagingContract,
  playerLinkService: PlayerLinkContract,
}

export class ServerSupervisor {

  static #instance: ServerSupervisor;

  #interfaceMessaging: StdIoMessagingContract;
  #playerLinkService: PlayerLinkContract

  #interfaceRequestInterpreter: InterfaceMessagingInterpreter;

  constructor(supervisorConfig: ServerSupervisorConfig) {
    if (ServerSupervisor.#instance) {
      throw new DuneError(ERROR.ONLY_ONE_INSTANCE_ALLOWED, [ this.constructor.name ]);
    }
    this.#interfaceMessaging = supervisorConfig.interfaceMessagingService;
    this.#playerLinkService = supervisorConfig.playerLinkService;

    this.#interfaceRequestInterpreter = new InterfaceMessagingInterpreter;

    this.#interfaceMessaging.addObserver((event) => this.#handleInterfaceCommand(event), InterfaceMessageType.COMMAND);

  }

  #handleInterfaceCommand(interfaceCommand: string): void {
    const { requestName, requestData } = this.#interfaceRequestInterpreter.transformRequest(interfaceCommand);
    if (requestName) {
      logger.info(`Interface request received: ${requestName}`, requestData);
      switch(requestName) {
        case('REQUEST_RESTART'): {
          this.#handleRestart();
          break;
        }
        case('REQUEST_ECHO'): {
          this.#handleEcho(requestData);
          break;
        }
        default: {
          logger.warn(LogType.I, `Unknown request received by ${this.constructor.name}: "${requestName}"`);
        }
      }
    }
  }

  /**
   * Send restart request on to PlayerLinkService. PLS will gracefully async restart
   * and send back a reconnect token (which has also been sent to clients)
   * This token must be supplied back as a CLI argument to the respawned server process
   * Interface will either receive data.token (on success) on a DuneError object
   */
  async #handleRestart(): Promise<void> {
    let stdIoResponseData = {};
    const restartSecret = env(EnvironmentKeys.RESTART_SECRET);
    if (typeof(restartSecret) !== 'string') {
      stdIoResponseData = new DuneError(ERROR.BAD_ENV_SECRET);
    }
    else {
      await this.#playerLinkService.requestRestart(restartSecret).then(response => {
        stdIoResponseData = { token: response };
      }).catch(error => {
        logger.error(LogType.CI, `Server restart was requested but server secret did not match`);
        stdIoResponseData = error;
      });
    }
    const responseString = this.#interfaceRequestInterpreter.transformResponse({
      responseName: StdIoResponseMapping[StdIoRequests.REQUEST_RESTART],
      responseData: stdIoResponseData,
    });
    this.#interfaceMessaging.sendRawToInterface(responseString);
  }

  #handleServerRestore(restoreToken: string) {
    logger.info(LogType.I, `Restoring server with token "${restoreToken}".`);
    // TO BE IMPLEMENTED
  }

  #handleEcho(requestData: GenericJson): void {
    const responseString = this.#interfaceRequestInterpreter.transformResponse({
      responseName: StdIoRequests.REQUEST_ECHO,
      responseData: requestData.data
    });
    this.#interfaceMessaging.sendRawToInterface(responseString);
  }

  processCommandLineOptions(commandLineOptions: CommandLineOptionCollection): void {
    commandLineOptions.forEach(option => {
      const [ key, value ] = Object.entries(option)[0];
      switch(`${key}`) {
        case (ConfigKeys.PORT): {
          config(ConfigKeys.PORT, value);
          break;
        }
        case (ConfigKeys.RESTART): {
          config(ConfigKeys.RESTART, value);
          break;
        }
      }
    });
    if (env(EnvironmentKeys.MODE) === 'restart' && config(ConfigKeys.RESTART)) {
      this.#handleServerRestore(config(ConfigKeys.RESTART) as string);
    }
  }

}