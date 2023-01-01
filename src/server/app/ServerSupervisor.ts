/**
 * This class should:
 * 	- supervise the commands coming in from the parent process
 * 	- shutdown the server when commanded to. this will required:
 * 		- saving state to local storage
 * 		- sending a ServerRestart event to clients with a token to allow reconnecting
 * 		- send a ShutdownComplete event to Server User Interface so it can kill the process and spawn a new one
 * 		- the SUI must spawn the new process with a --restart=sessionToken command so the new server knows it's a ghola
 *  - pass other commands to local hub (or wherever required)
 *  - respond to the SUI with feedback on other commands as required
 * 
 * Needs direct access to:
 * 	- SocketServer
 *  - InterfaceMessagingService
 */

import { DuneError } from "../errors/DuneError.js";
import { ERROR } from "../errors/errors.js";
import { InterfaceMessageType, InterfaceMessagingService } from "../io/InterfaceMessagingService.js";
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

	constructor(supervisorConfig: ServerSupervisorConfig) {
		if (ServerSupervisor.#instance) {
			throw new DuneError(ERROR.ONLY_ONE_INSTANCE_ALLOWED, [ this.constructor.name ]);
		}
		this.#interfaceMessaging = supervisorConfig.interfaceMessagingService;
		this.#playerLinkService = supervisorConfig.playerLinkService;

		this.#interfaceMessaging.addObserver(this.#handleInterfaceCommand, InterfaceMessageType.COMMAND);
	}

	#handleInterfaceCommand(interfaceCommand: string): void {
		console.log('interface message received');
	}

}