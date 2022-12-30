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
 */