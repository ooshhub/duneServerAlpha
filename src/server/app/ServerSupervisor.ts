import { ConfigKeys } from "../config/ConfigKeyTypes.js";
import { DuneError } from "../errors/DuneError.js";
import { ERROR } from "../errors/errors.js";
import { StdIoEventMapping } from "../events/mapping/StdIoEventMapping.js";
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
					this.#handleRestart(requestData);
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

	#handleRestart(requestData: GenericJson): void {
		// handle restart
	}

	#handleEcho(requestData: GenericJson): void {
		const responseString = this.#interfaceRequestInterpreter.transformResponse({
			responseName: StdIoEventMapping.REQUESTS.REQUEST_ECHO,
			responseData: requestData.data
		});
		this.#interfaceMessaging.sendRawToInterface(responseString);
	}

	// TODO: Processing Config keys should be done in ConfigManager - just the restart stuff here
	processCommandLineOptions(commandLineOptions: CommandLineOptionCollection): void {
		commandLineOptions.forEach(option => {
			const [ key, value ] = Object.entries(option)[0];
			switch(`${key}`) {
				case (ConfigKeys.PORT): {
					config(ConfigKeys.PORT, value);
					break;
				}
			}
		});
	}

}