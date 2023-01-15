import { DuneError } from "../errors/DuneError.js";
import { ERROR } from "../errors/errors.js";
import { InterfaceMessagingInterpreter } from "../io/InterfaceMessagingInterpreter.js";
import { InterfaceMessageType } from "../io/InterfaceMessagingService.js";
import { PlayerLinkContract } from "../serviceProviderRegistry/contracts/PlayerLinkContract.js";
import { StdIoMessagingContract } from "../serviceProviderRegistry/contracts/StdIoMessagingContract.js";

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
		const request = this.#interfaceRequestInterpreter.transformRequest(interfaceCommand);
		if (request) {
			logger.info(`Interface request received: ${request.requestName}`, request.requestData);
			if (request.requestName.indexOf('REQUEST_ECHO') > -1) {
				process.stdout.write(`%RESPONSE_ECHO%${request.requestData.data}`);
			}
		}	
	}

}