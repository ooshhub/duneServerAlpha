import process, { stdin, stdout } from "process";
import readLine from "readline/promises";

/**
 * TODO: write interfaces for:
 *  - player communication
 *  - lobby functionality
 *  - data storage
 *  - ruleset interaction
 * 
 * TODO: create event system for server.... localHub should do it?
 *  - simple event routing to handle player ids / houses etc. and route the traffic to the right place
 *  - game core only cares about houses
 * 	- socket.io server only cares about sockets
 *  - WhoIs service takes care of translating playerId/houseId/socketId
 *  - WhoIs service sits between socket layer and game core
 *  - All other house functions are internal to game core
 * 
 * TODO: server functions for the following
 *  - wrapper function for async request with retries for requesting data from players
 *  - listener functions for player data requests (e.g. player requests update due to reconnect)
 *  - player polling, e.g. for opportunities for playing cards at certain points in the game
 * 
 */


// Listen to stdin for instructions
	// TODO: write a stdin interface for server commands

// Spin up a server when given port number
	// TODO: rewrite socketserver
	// careful where you put your handlers when spinning up a server, dickhead

// Listen for players joining

// Player [localhost] is always host when server is in self-host mode
// host-passing doesn't matter until remote deploy happens

// Player host is the source of truth until a lobby in finalised, then the server is boss.
	// TODO: rewrite lobby functionality

// Start the game. Play. Win. Coding complete.





/**
 * TEMP STUFF BELOW IS PROBABLY JUNK
 */


// const serverCommands = (() => {

// 	const STATUS_MARKER = `%STATUS%`;

// 	const echo = (inputString: string) => {
// 		const output = inputString.replace(/^%\w+%/, '');
// 		process.stdout.write(`${STATUS_MARKER}${output}`);
// 	}

// 	const pong = () => {
// 		process.stdout.write(`${STATUS_MARKER}pong`);
// 	}

// 	const log = (message: string) => {
// 		message = message.replace(/^\s*%\w+%/, '');
// 		logger.log(message);
// 	}

// 	return { echo, pong, log }

// })();

// const mockServer = (async () => {

// 	await logger.init();

// 	const STATUS_MARKER = `%STATUS%`;

// 	const COMMANDS: { [key: string]: (message: string) => void } = {
// 		"ECHO": serverCommands.echo,
// 		'PING': serverCommands.pong,
// 		'LOG':	serverCommands.log
// 	}

// 	const exitServer = () => {
// 		logger?.destroy();
// 		process.exit();
// 	}

// 	const stdInReader = readLine.createInterface({
// 		input: stdin,
// 		output: stdout,
// 	});
// 	stdInReader.on('line', async (message) => {
// 		message = message.trim();
// 		const isCommand = message.match(/^%(\w+)%/);
// 		if (isCommand) {
// 			const command = `${isCommand[1]}`;
// 			if (Reflect.has(COMMANDS, command)) {
// 				COMMANDS[command](message);
// 				return;
// 			}
// 		}
// 		else process.stdout.write(`Server knows not this command.`);
// 	});

// 	await logger.warn('Fucking shit eh');
// 	process.stdout.write(`${STATUS_MARKER}Server is online`);
	
// });

// await mockServer();