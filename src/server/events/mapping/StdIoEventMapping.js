// Mapping requests through stdin to responses sent through stdout
export const StdIoEventMapping = {
	REQUESTS: {
		REQUEST_RESTART 	: 'RESPONSE_RESTART',
		REQUEST_EXIT			:	'RESPONSE_EXIT',
		REQUEST_HARD_EXIT	: '', // process.stdout will send 'exit'
		REQUEST_STATUS		: 'RESPONSE_STATUS',
		REQUEST_CLIENTS		: 'RESPONSE_CLIENTS',
		REQUEST_ECHO			: 'RESPONSE_ECHO',
	},

	// Updates sent by server through stdout without a request
	UPDATES: {
		UPDATE_STATUS			: 'UPDATE_STATUS',
		UPDATE_ERROR			: 'UPDATE_ERROR',
		UPDATE_CLIENTS		: 'UPDATE_CLIENTS',
	},

	LOGGING: {
		CONSOLE:		'CONSOLE',
		INTERFACE: 	'INTERFACE',
	}
}