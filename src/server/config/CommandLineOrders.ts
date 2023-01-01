
type CommandLineOrder = {
	command: string,
	parameters: string[],
}
type CommandLineOrderCollection = {
	[commandName: string]: CommandLineOrder
}

// -restart,token=123124124,name=bob
// Optional parameters marked with leading ?

export const CommandLineOrders: CommandLineOrderCollection = {
	restart: {
		command: 'RESTART',
		parameters: [ 'token', '?name' ],
	}
}