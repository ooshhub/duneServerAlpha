export const ERROR = {
	// Classes, types
	ONLY_ONE_INSTANCE_ALLOWED: `Only one instance of %0 can be instantiated.`,
	MUST_OVERRIDE_METHOD: `%0 failed to override method %1`,
	NO_INSTANTIATION:	`%0 Class cannot be instantiated`,

	// Socket.io
	SERVER_NOT_ACCEPTING: `Player tried to join from %0, but server is in state %1 and not accepting players.`,
	BAD_HEADERS: `Refused connection due to bad/missing headers`,
	CONNECTION_SPAM: `Refused connection due to too many attempts.`,
	NO_HOST_IN_SERVER: `Player connection refused: Host has not yet joined server.`,
	BAD_PLAYER_DATA: `Connection %0 dropped - bad Dune Player data`,
	BAD_PASSWORD: `Player %0 dropped due to bad password.`,
	BAD_RECONNECT: `Player ID "%0" already in server and connection did not contain valid reconnect headers.`,
	STILL_CONNECTED: `Player ID "%0" tried to reconnect, but old socket is still active`,
	BAD_SETUP: `Bad setup, server cannot start.`,

	// Events
	BAD_EVENT_DATA: `Bad data supplied to DuneEventDispatcher, could not create Event.`,
	BAD_EVENT_DOMAIN: `Unknown target domain for event: %0`,
	REQUEST_TIMEOUT: `Request timed out for event name "%0"`,

	// Responses
	PLAYER_RESPONSE_TIMEOUT: `Player %0 did not respond within the %1ms timeout`,
	EMPTY_RESPONSE: `Received response but no data sent to constructor`,

	// IO
	FILE_QUEUE_UNRESPONSIVE: `File IO queue is unresponsive.`,
	FILE_READ_ERROR: `Failed to read file "%0"`,
	IO_JOB_TYPE_UNKNOWN: `The supplied File IO job type was invalid, "%0"`,
	BAD_WRITE_DATA: `Data supplied to FileWrite must be a string or JSON`,

	// Config & Boot
	CONFIG_ALREADY_BOOTED: `ConfigManager can only boot once, and has already been executed.`,
	BAD_CONFIG_TYPE: `ConfigManager error setting key "%0" - value "%1" is not of type "%2".`,
	CONFIG_KEY_NOT_FOUND: `ConfigManager error - config key "%0" not found.`,
	
}