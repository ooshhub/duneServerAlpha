import { DuneEventDispatcher } from "./events/DuneEventDispatcher.js";
import { ServiceProviderRegistry } from "./serviceProviderRegistry/ServiceProviderRegistry.js";
import * as dotenv from 'dotenv';
import { ConfigManager } from "./app/ConfigManager.js";
import { PathHelper, PathTo } from "./app/PathHelper.js";
import { EnvironmentKeys } from "./config/EnvironmentKeyTypes.js";
import { ServerSupervisor } from "./app/ServerSupervisor.js";
import { LogType } from "./utils/logger/ServerLogger.js";

// Provide default Console as a global logger to catch any logging done before our own ServiceProviders have registered
global.logger = console;

// Initialise dotenv, boot ConfigManager to process env and CLI options
dotenv.config({
	path: `./${process.env.NODE_ENV}.env`,
});
ConfigManager.boot();
console.log('config booted');

const environment = env(EnvironmentKeys.ENVIRONMENT);
console.log(environment);

// Start Path helper
const basePath = environment === 'production'
	? process.cwd()
	: process.argv[1].replace(/[^/\\]+$/, '');
PathHelper.boot(basePath);

console.log('path booted');

// Register core service providers and server supervisor
const serviceRegistry = new ServiceProviderRegistry();
const serverSupervisor = new ServerSupervisor({
	interfaceMessagingService: serviceRegistry.stdIoMessaging,
	playerLinkService: serviceRegistry.playerLinkProvider,
});

console.log('service providers registered');

// Start Event Dispatcher
const eventDispatcher = new DuneEventDispatcher({
	name: 'EventDispatcher',
	playerLinkService: serviceRegistry.playerLinkProvider,
	localHubService: serviceRegistry.localHubService
});
global.dispatch = eventDispatcher.dispatchEvent;
global.request = eventDispatcher.dispatchRequest;

console.log('event dispatcher created');

logger.warn(LogType.CFI, `You're a cunt.`);

// initialise socketserver on request from stdin

// close on requeset
