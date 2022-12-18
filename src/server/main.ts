import { ServerApp } from "./app/ServerApp";
import { ServiceProviderRegistry } from "./serviceProviderRegistry/ServiceProviderRegistry";
import { LogType } from "./utils/logger/ServerLogger";
// import '../types/main';

// Grab process.argv

// Default to Console for debugging until overridden in ServiceProviderRegistry
global.logger = console;

const commandLineArguements = process.argv;
console.log(commandLineArguements);

const serviceRegistry = new ServiceProviderRegistry();
logger.log(LogType.CFI, 'test message');

const server = new ServerApp(serviceRegistry);

// initialise socketserver on request from stdin

// close on requeset
