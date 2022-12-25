import { DuneEventHub } from "../events/DuneEventHub";
import { PlayerDirectoryService } from "../net/PlayerDirectoryService";
import { SocketServer } from "../net/SocketServer";
import { InterfaceMessagingService } from "../utils/logger/InterfaceMessagingService";
import { ServerLogger } from "../utils/logger/ServerLogger";
import { ConsoleLoggingContract } from "./contracts/ConsoleLoggingContract";
import { LocalHubContract } from "./contracts/LocalHubContract";
import { PlayerLinkContract } from "./contracts/PlayerLinkContract";
import { StdIoMessagingContract } from "./contracts/StdIoMessagingContract";

const defaultServiceProviders = {
	loggingService: [ ServerLogger ],
	directoryService: [ PlayerDirectoryService ],
	playerLinkService: [ SocketServer ],
	localHub: [ DuneEventHub ],
	stdIoMessaging: [ InterfaceMessagingService ],
}

export class ServiceProviderRegistry {

	// Essential Providers
	#stdIoMessaging: StdIoMessagingContract; 
	#localStorage: LocalStorageInterface;
	#rulesetControl: RulesetInterface;

	#playerLinkService: PlayerLinkContract;
	#localHubService: LocalHubContract;
	#directoryService: PlayerDirectoryService;

	// Secondary Providers
	#loggingService: ConsoleLoggingContract

	constructor(
		stdIoMessaging = defaultServiceProviders.stdIoMessaging,
		loggingService = defaultServiceProviders.loggingService,
		rulesetControl = defaultServiceProviders.rulesetControl,
		localStorage = defaultServiceProviders.localStorage,
		localHubService = defaultServiceProviders.localHub,
		directoryService = defaultServiceProviders.directoryService,
		playerLinkService = defaultServiceProviders.playerLinkService
	)
	{
		this.#loggingService = new loggingService();
		global.logger = this.#loggingService;

		this.#stdIoMessaging = stdIoMessaging;

		this.#localHubService = new localHubService();
		this.#directoryService = new directoryService();
		this.#playerLinkService = new playerLinkService(this.#directoryService);

		this.rulesetControl = rulesetControl;
		this.localStorage = localStorage;

	}

	#registerServiceProvider(serviceProvider: any[])

	get stdIoMessaging() { return this.#stdIoMessaging }
	get clientLinkProvider() { return this.#playerLinkService }
	get rulesetControl() { return this.#rulesetControl }
	get localStorage() { return this.#localStorage }
	get loggingService() { return this.#loggingService }

}