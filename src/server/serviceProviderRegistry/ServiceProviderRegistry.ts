import { PlayerDirectoryService } from "../net/PlayerDirectoryService";
import { SocketServer } from "../net/SocketServer";
import { ServerLogger } from "../utils/logger/ServerLogger";
import { ConsoleLoggingInterface } from "./interfaces/ConsoleLoggingInterface";
import { PlayerLinkInterface } from "./interfaces/PlayerLinkInterface";
import { StdInReaderInterface } from "./interfaces/StdInReaderInterface";

const defaultServiceProviders = {
	loggingService: ServerLogger,
	directoryService: PlayerDirectoryService,
	playerLinkService: SocketServer
}

export class ServiceProviderRegistry {

	// Essential Providers
	#stdInReader: StdInReaderInterface; 
	#localStorage: LocalStorageInterface;
	#rulesetControl: RulesetInterface;

	#playerLinkService: PlayerLinkInterface;
	#directoryService: PlayerDirectoryService;

	// Secondary Providers
	#loggingService: ConsoleLoggingInterface

	constructor(
		stdInReader = defaultServiceProviders.stdInReader,
		loggingService = defaultServiceProviders.loggingService,
		rulesetControl = defaultServiceProviders.rulesetControl,
		localStorage = defaultServiceProviders.localStorage,
		directoryService = defaultServiceProviders.directoryService,
		playerLinkService = defaultServiceProviders.playerLinkService
	)
	{
		this.#loggingService = new loggingService();
		global.logger = this.#loggingService;

		this.#stdInReader = stdInReader;

		this.#directoryService = new directoryService();
		this.#playerLinkService = new playerLinkService(this.#directoryService);

		this.rulesetControl = rulesetControl;
		this.localStorage = localStorage;

	}

	get stdInReader() { return this.#stdInReader }
	get clientLinkProvider() { return this.#playerLinkService }
	get rulesetControl() { return this.#rulesetControl }
	get localStorage() { return this.#localStorage }
	get loggingService() { return this.#loggingService }

}