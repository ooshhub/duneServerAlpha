import { DuneEventHub } from "../events/DuneEventHub.js";
import { InterfaceMessagingService } from "../io/InterfaceMessagingService.js";
import { NodeFileManager } from "../io/NodeFileManager.js";
import { PlayerDirectoryService } from "../net/PlayerDirectoryService.js";
import { SocketServer } from "../net/SocketServer.js";
import { ServerLogger } from "../utils/logger/ServerLogger.js";
import { LocalHubConfig, LocalHubContract } from "./contracts/LocalHubContract.js";
import { LocalStorageConfig, LocalStorageContract } from "./contracts/LocalStorageContract.js";
import { PlayerDirectoryServiceConfig, PlayerDirectoryServiceContract } from "./contracts/PlayerDirectoryServiceContract.js";
import { PlayerLinkContract, SocketServerConfig } from "./contracts/PlayerLinkContract.js";
import { ServerLoggerConfig, ServerLoggingContract } from "./contracts/ServerLoggingContract.js";
import { StdIoMessagingContract, StdIoMessengerConfig } from "./contracts/StdIoMessagingContract.js";

type GenericClass<Type> = {
  new( ...args: any[]): Type;
}

type ProviderConstructorArguments<ConfigType> = [ ConfigType ] 

export type ServiceProviderConfiguration = {
  provider: GenericClass<any>,
  constructorArguments: ProviderConstructorArguments<any>,
}

type DefaultServiceProviders = {
  [providerName: string]: ServiceProviderConfiguration
}


const defaultServiceProviders: DefaultServiceProviders = {
  loggingService: {
    provider: ServerLogger,
    constructorArguments: ([ {} ] as [ ServerLoggerConfig ]),
  },
  directoryService: {
    provider: PlayerDirectoryService,
    constructorArguments: ([{ name: 'PlayerDirectory' }] as [ PlayerDirectoryServiceConfig ]),
  },
  playerLinkService: {
    provider: SocketServer,
    constructorArguments: ([{ name: 'DuneSocketServer' }] as [ SocketServerConfig ]),
  },
  localHub: {
    provider: DuneEventHub,
    constructorArguments: ([{ name: 'ServerHub' }] as [ LocalHubConfig ]),
  },
  stdIoMessaging: {
    provider: InterfaceMessagingService,
    constructorArguments: ([ { autoInitialiseListeners: true } ] as [ StdIoMessengerConfig ]),
  },
  localStorageService: {
    provider: NodeFileManager,
    constructorArguments: ([{ name: 'NodeLocalStorageManager', basePath: './src/server'}] as [ LocalStorageConfig ]),
  },
}

export class ServiceProviderRegistry {

  // Essential Providers
  #stdIoMessaging: StdIoMessagingContract; 
  #localStorage: LocalStorageContract;

  #playerLinkService: PlayerLinkContract;
  #localHubService: LocalHubContract;
  #directoryService: PlayerDirectoryServiceContract;

  // Secondary Providers
  #loggingService: ServerLoggingContract;

  constructor(
    stdIoMessaging = defaultServiceProviders.stdIoMessaging,
    loggingService = defaultServiceProviders.loggingService,
    localStorage = defaultServiceProviders.localStorageService,
    localHubService = defaultServiceProviders.localHub,
    directoryService = defaultServiceProviders.directoryService,
    playerLinkService = defaultServiceProviders.playerLinkService
  )
  {
    this.#loggingService = new loggingService.provider(...loggingService.constructorArguments);
    global.logger = this.#loggingService;
    this.#directoryService = new directoryService.provider(...directoryService.constructorArguments);
    global.playerDirectory = this.#directoryService;

    this.#stdIoMessaging = new stdIoMessaging.provider(...stdIoMessaging.constructorArguments);
      this.#loggingService.registerInterfaceLogger(this.#stdIoMessaging);

    this.#localHubService = new localHubService.provider(...(localHubService.constructorArguments));
    this.#playerLinkService = new playerLinkService.provider(...playerLinkService.constructorArguments);

    this.#localStorage = new localStorage.provider(...localStorage.constructorArguments);

  }

  get stdIoMessaging() { return this.#stdIoMessaging; }
  get playerLinkProvider() { return this.#playerLinkService; }
  get localStorage() { return this.#localStorage; }
  get loggingService() { return this.#loggingService; }
  get localHubService() { return this.#localHubService ;}

}