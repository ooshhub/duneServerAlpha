import { DuneEventDispatcher } from "./events/DuneEventDispatcher.js";
import { ServiceProviderRegistry } from "./serviceProviderRegistry/ServiceProviderRegistry.js";
import * as dotenv from 'dotenv';
import { ConfigManager } from "./app/ConfigManager.js";
import { PathHelper } from "./app/PathHelper.js";
import { EnvironmentKeys } from "./config/EnvironmentKeyTypes.js";
import { ServerSupervisor } from "./app/ServerSupervisor.js";
import { LogType } from "./utils/logger/ServerLogger.js";
import { ConfigKeys } from "./config/ConfigKeyTypes.js";

// Provide default Console as a global logger to catch any logging done before our own ServiceProviders have registered
global.logger = console;
// Initialise dotenv, boot ConfigManager to process env and CLI options
dotenv.config({
	path: `./${process.env.NODE_ENV}.env`,
});
const commandLineOptions = ConfigManager.boot();

const environment = env(EnvironmentKeys.ENVIRONMENT);

// Start Path helper
const basePath = environment === 'production'
	? process.cwd()
	: process.argv[1].replace(/[^/\\]+$/, '');
PathHelper.boot(basePath);

// Register core service providers and server supervisor
const serviceRegistry = new ServiceProviderRegistry();
const serverSupervisor = new ServerSupervisor({
	interfaceMessagingService: serviceRegistry.stdIoMessaging,
	playerLinkService: serviceRegistry.playerLinkProvider,
});

logger.warn(process.argv);
// Now ServerSupervisor needs to check the CLI options for server mode
// e.g., did the server just do a forced restart and needs to restore some state?
serverSupervisor.processCommandLineOptions(commandLineOptions);

// Start Event Dispatcher
const eventDispatcher = new DuneEventDispatcher({
	name: 'EventDispatcher',
	playerLinkService: serviceRegistry.playerLinkProvider,
	localHubService: serviceRegistry.localHubService
});
global.dispatch = eventDispatcher.dispatchEvent;
global.request = eventDispatcher.dispatchRequest;

logger.warn(commandLineOptions);
logger.info(LogType.I, `Server is online. Listening on port ${config(ConfigKeys.PORT)}`);

// initialise socketserver on request from stdin

// close on requeset
