import { ServiceProviderRegistry } from "../serviceProviderRegistry/ServiceProviderRegistry";

export class ServerApp {

	#gameCore: DuneCore;
	#lobbyManager: LobbyManager;
	#rulesetManager: RulesetInterface;

	#clientLink: ClientLinkInterface;
	#commandReader: StdInReaderInterface;

	#localStorageManager: LocalStorageInterface;
	
	constructor(serviceRegistry: ServiceProviderRegistry) {
		this.#clientLink = serviceRegistry.clientLinkProvider;
		this.#gameCore = new DuneCore;
		this.#commandReader = serviceRegistry.stdInReader;
		this.#rulesetManager = new this.#rulesetManager;
		this.#localStorageManager = serviceRegistry.localStorage;
		this.#clientLink.registerMessageObserver(this.#processPlayerMessage);
		this.#clientLink.registerRequestObserver(this.#processPlayerRequest);
	}

	async #processPlayerMessage(message: GenericJson) {

	}

	async #processPlayerRequest(request: GenericJson) {
		
	}

}