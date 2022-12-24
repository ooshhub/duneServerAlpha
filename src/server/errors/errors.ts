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

}