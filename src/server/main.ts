import { DuneEventDispatcher } from "./events/DuneEventDispatcher.js";
import { ServiceProviderRegistry } from "./serviceProviderRegistry/ServiceProviderRegistry.js";
import { LogType } from "./utils/logger/ServerLogger.js";
import * as dotenv from 'dotenv';
import { ConfigManager } from "./app/ConfigManager.js";
import { fileURLToPath } from "url";
import { PathHelper, PathTo } from "./app/PathHelper.js";
import { EnvironmentKeys } from "./config/EnvironmentKeyTypes.js";

// Provide default Console as a global logger to catch any logging done before our own ServiceProviders have registered
global.logger = console;

// Initialise dotenv, boot ConfigManager to process env and CLI options
dotenv.config();
ConfigManager.boot();
console.log(env(EnvironmentKeys.ENVIRONMENT));

// Start Path helper
const basePath = fileURLToPath(import.meta.url).replace(/[^/\\]+$/, '');
PathHelper.boot(basePath);
console.log(path(PathTo.LOGS));

const serviceRegistry = new ServiceProviderRegistry();
// logger.warn(LogType.CFI, 'test warning');

const eventDispatcher = new DuneEventDispatcher({
	name: 'EventDispatcher',
	playerLinkService: serviceRegistry.playerLinkProvider,
	localHubService: serviceRegistry.localHubService
});
global.dispatch = eventDispatcher.dispatchEvent;
global.request = eventDispatcher.dispatchRequest;


// initialise socketserver on request from stdin

// close on requeset
