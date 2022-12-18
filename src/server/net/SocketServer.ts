import { createServer } from "http";
import { Server, Socket } from 'socket.io';
import { DuneError } from "../errors/DuneError";
import { ERROR } from "../errors/errors";
import { DuneEvent, DuneServerEvent, DuneServerResponse } from "../events/DuneServerEvent";
import { PlayerLinkInterface } from "../serviceProviderRegistry/interfaces/PlayerLinkInterface";
import { Helpers } from "../utils/Helpers";
import { LogType } from "../utils/logger/ServerLogger";
import { PlayerDirectoryService } from "./PlayerDirectoryService";

export type ServerOptions = {
	name: string|undefined,
	port: number|undefined,
	path: string|undefined,
	password: string|undefined,
	local: boolean|undefined,
	timeout: number|undefined,
	autoStart: boolean|undefined,
	requestTimeout: number|undefined,
	customMiddleware: (...args: any[]) => void | undefined,
	customMessaging: any[]|undefined,
}

export type HostOptions = {
	name: string,
	playerId: string,
	connected: boolean,
}

const defaultOptions = {
	name: 'Dune Server',
	port: 8080,
	path: '/',
	password: '',
	local: true,
	timeout: 5000,
	autoStart: true,
	requestTimeout: 10000,
};

enum ServerState {
	INIT 		= 'Initialising',
	HOST    = 'Awaiting Host',
	LOBBY   = 'In Lobby',
	BUSY		= 'Busy',
	OPEN		= 'Accepting Players',
	FULL		= 'Full',
	DESTROY	= 'Destroying',
	ERROR		= 'Error'
}

export enum SocketServerObserverType {
	MESSAGE = 'message',
	REQUEST = 'request',
}

export type DuneEventHandler = (message: DuneEvent|GenericJson, ...args: any[]) => void;

export class SocketServer implements PlayerLinkInterface {

	#io?: Server
	#state = ServerState.INIT;

	// TODO: Define a playerlist object
	#playerList: { [key: string]: GenericJson } = {};

	#config?: ServerOptions;
	#host?: HostOptions;

	#connectionAttempts: { [key: string]: number } = {};
	#maxConnectionAttempts = 10;

	#sessionToken: string|undefined;

	#messageObservers: DuneEventHandler[] = [];
	#requestObservers: DuneEventHandler[] = [];
	#directoryService: PlayerDirectoryService;
	
	constructor(directoryService: PlayerDirectoryService) {
		this.#directoryService = directoryService;
	}

	setupServer(serverOptions: ServerOptions, playerDetails: HostOptions): void {
		this.#config = Object.assign(defaultOptions, serverOptions);
		this.#host = playerDetails;
		this.#host.connected = false;
		const httpServer = createServer();
		this.#io = new Server(httpServer, {
			path: this.#config.path,
			connectTimeout: this.#config.timeout
		});
		httpServer.listen(this.#config.port);
		if (this.#config.autoStart) this.startServer();
		else logger.log(`Server initialised, awaiting serverStart instruction.`);
	}

	startServer() {
		if (!this.#config || !this.#host || !this.#io) {
			logger.error(this.#config, this.#host, this.#io);
			throw new DuneError(ERROR.BAD_SETUP);
		}
		this.loadMiddleware(this.#config.customMiddleware);
		this.#startConnectionListener(this.#config.customMessaging);
	}

	get state() { return this.#state }
	set state(newState: ServerState) { this.#state = newState }

	get allPlayerIds() { return Object.keys(this.#playerList); }

	#isLocalConnection(socketAddress: string): boolean {
		const accepted = [ '127.0.0.1', 'localhost' ];
		return  accepted.includes(socketAddress)
			? true
			: false;
	}

	loadMiddleware(customMiddleware: (...args: any[]) => void | undefined) {
		const defaultVerifyUpgradeMiddleware = async (socket: Socket, next: () => void) => {
			const validStates = [ ServerState.INIT, ServerState.HOST, ServerState.OPEN, ServerState.LOBBY ];
			logger.log(LogType.CI, `Incoming connection attempt from ${socket.handshake.address}...`);
			this.#addConnectionAttempt(socket.handshake.address);
			if (this.#exceededMaxConnectionAttempts(socket.handshake.address)) { // refuse spammed connections that keep failing
				logger.log(LogType.CI, ERROR.CONNECTION_SPAM);
				return;
			}
			if (socket.handshake.headers.game !== 'dune' || !socket.handshake.auth?.playerName) { // refuse connectino missing Dune headers
				logger.log(LogType.CI, ERROR.BAD_HEADERS);
				return;
			}
			if (!validStates.includes(this.state)) { // refuse connection if server is not in appropriate state
				logger.warn(new DuneError(ERROR.SERVER_NOT_ACCEPTING, [ socket.handshake.address, this.state ]));
				return;
			}
			if (!this.#host?.connected) {
				if (this.#config?.local) {
					if (!this.#isLocalConnection(socket.handshake.address)) {
						logger.warn(LogType.CI, ERROR.NO_HOST_IN_SERVER);
						return;
					}
				}
				else {
					// TODO: Implement Host checking for remote servers when required
				}
			}			
			next();
		}
		const middleware = customMiddleware ?? defaultVerifyUpgradeMiddleware;
		this.#io?.use(middleware);
	}

	/**
	 * IP connection attempt guard
	 * @param address
	 */
	#addConnectionAttempt(address: string): void {
		const cleanIp = address.replace(/\./g, '_').replace(/[^\d_]/g, '');
		this.#connectionAttempts[cleanIp] = this.#connectionAttempts[cleanIp] ? this.#connectionAttempts[cleanIp] + 1 : 1;
	}
	#resetConnectionAttempts(address: string): void {
		const cleanIp = address.replace(/\./g, '_').replace(/[^\d_]/g, '');
		this.#connectionAttempts[cleanIp] = 0;
	}
	#exceededMaxConnectionAttempts(address: string): boolean {
		const cleanIp = address.replace(/\./g, '_').replace(/[^\d_]/g, '');
		return this.#connectionAttempts[cleanIp] > this.#maxConnectionAttempts
			? true
			: false;
	}

	/**
	 * Ping a socket to check if still alive
	 * @param socket 
	 * @returns 
	 */
	async #healthCheckAck(socket: Socket): Promise<boolean> {
    return new Promise(res => socket.emit('healthCheck', () => res(true)));
  }
  async #healthCheckSocket(playerId: string, ackTimeout = 3000): Promise<boolean> {
    if (!this.#playerList[playerId]) return false;
    return await Promise.race([
      Helpers.timeout(ackTimeout),
      this.#healthCheckAck(this.#playerList[playerId].socket)
    ]);
  }

	/**
	 * Check if player is host
	 * @param playerId
	 * @param socketAddress 
	 * @returns 
	 */
	#isPlayerHost(playerId: string, socketAddress: string): boolean {
		if (!this.#host?.playerId) {
			if (this.#config?.local) {
				return this.#isLocalConnection(socketAddress)
					? true
					: false;
			} else {
				// TODO: Implement remote host checking when needed
				return false;
			}
		} else {
			return playerId === this.#host.playerId;
		}
	}

	/**
	 * Start the main connection listener
	 * @param customMessaging
	 */
	#startConnectionListener(customMessaging: any[] | undefined): void {
		if (customMessaging?.length) {
			customMessaging.forEach(handler => {
				this.#io?.on(handler.eventName, async (socket: Socket) => handler.eventHandler(socket));
			});
		}
		this.#io?.on('connection', async (socket) => {
			logger.log(`Upgraded connection from ${socket.handshake.address}.`);
			const playerDetails = socket.handshake.auth,
				playerIsReconnecting = socket.handshake.headers.reconnect;
			// Check basic connection info
			let authFailure = null;
			if (!playerDetails.playerName || !playerDetails.pid) authFailure = new DuneError(ERROR.BAD_PLAYER_DATA, [ socket.handshake.address ]);
			if (this.#config?.password && (this.#config.password !== playerDetails.password)) authFailure = new DuneError(ERROR.BAD_PASSWORD, [ playerDetails.playerName ]);
			if (this.#playerList[playerDetails.playerId] && (!playerIsReconnecting || socket.handshake.auth.sessionToken !== this.#sessionToken)) authFailure = new DuneError(ERROR.BAD_RECONNECT, [ playerDetails.playerId ]);
			if (authFailure) {
				socket.disconnect();
				this.#addConnectionAttempt(socket.handshake.address);
				logger.log(LogType.CI, authFailure);
			}
			// Handle a valid reconnection - reassign the player socket to the incoming one
			if (this.#playerList[playerDetails.playerId]) {
				logger.log(LogType.CI, `Reconnect attempt from ${socket.handshake.address}`);
				const socketIsAlive = await this.#healthCheckSocket(playerDetails.playerId);
				if (socketIsAlive) {
					logger.log(LogType.CI, new DuneError(ERROR.STILL_CONNECTED, [ playerDetails.playerId ]));
					socket.disconnect();
				}
				else {
					this.#playerList[playerDetails.playerId] = playerDetails;
					this.#playerList[playerDetails.playerId].socket = socket;
				}
			}
			else { // clean, new connection attempt
				// Return the session token to the connecting player
				Object.assign(playerDetails, {
					isHost: this.#isPlayerHost(playerDetails.playerId, socket.handshake.address),
					sessionToken: this.#sessionToken
				});
				socket.emit('auth', playerDetails);
				// Attach the player details and socket to the server list
				this.#playerList[playerDetails.playerId] = playerDetails;
				this.#playerList.socket = socket;
				if (playerDetails.isHost && !playerIsReconnecting && this.#host) {
					this.#host.playerId = this.#host.playerId ?? playerDetails.playerId;
					this.#host.connected = true;
					this.state = ServerState.HOST
				}
				this.#attachSocketListeners(socket);
				this.#resetConnectionAttempts(socket.handshake.address);
				logger.log(LogType.CI, `Player ${playerDetails.playerName}${playerDetails.isHost ? ' [HOST]' : ''} joined the server.`);
			}
		});
	}

	/**
	 * Attach event listeners to a successful Socket connection
	 * @param socket
	 */
	#attachSocketListeners(socket: Socket): void {
		socket.on('disconnect', this.#handlePlayerDisconnect);
		socket.on('reconnect', this.#handlePlayerReconnect);
		socket.on('message', this.#processPlayerMessage);
		socket.on('request', this.#processPlayerRequest);
	}

	// TODO: Implement disconnection handling, with extra isHost logic
	#handlePlayerDisconnect(...args: any[]) {
		logger.warn(LogType.C, ...args);
	}
	#handlePlayerReconnect() {
		// Implement if required
	}

	/**
	 * Receive messages from players
	 * @param socket 
	 * @param data 
	 * @param ack 
	 * @returns 
	 */
	async #processPlayerMessage(socket: Socket, data: GenericJson): Promise<void> {
		if (!data.eventName || !data.eventData) {
			logger.warn(`Bad event data received by server`, data);
			return;
		}
		data.received_at = Date.now();
		this.#messageObservers.forEach((observer: DuneEventHandler) => observer(data));
	}

	async #processPlayerRequest(socket: Socket, data: GenericJson, ack: GenericFunction): Promise<void> {
		if (!data.eventName || !data.eventData) {
			logger.warn(`Bad event data received by server`, data);
			return;
		}
		data.received_at = Date.now();
		this.#requestObservers.forEach((observer: DuneEventHandler) => observer(data, ack));
	}

	/**
	 * Register or remove Handlers for server message events
	 * @param observerType 
	 * @param handler 
	 * @returns 
	 */
	registerObserver(observerType: SocketServerObserverType, handler: DuneEventHandler): void {
		const targetArray = this.#getObserverTarget(observerType);
		if (!targetArray) return;
		if (!targetArray.includes(handler)) targetArray.push(handler);
	}
	removeObserver(observerType: SocketServerObserverType, handler: DuneEventHandler): void {
		const targetArray = this.#getObserverTarget(observerType);
		if (!targetArray) return;
		if (targetArray.includes(handler)) Helpers.filterInPlace(targetArray, (value) => value !== handler);
	}
	#getObserverTarget(observerType: SocketServerObserverType): DuneEventHandler[] | null {
		return observerType === SocketServerObserverType.MESSAGE
		? this.#messageObservers
		: observerType === SocketServerObserverType.REQUEST
			? this.#requestObservers
		: null;
	}

	/**
	 * Send messages to player(s)
	 * @param message 
	 * @param channel 
	 */
	async sendPlayerMessage(message: DuneServerEvent, channel = 'message'): Promise<void> {
		if (message.to?.length) {
			const targets = this.#directoryService.convertToPlayerIds(message.to);
			targets.forEach(target => {
				if (this.#playerList[target]) this.#playerList[target].emit(channel, message);
			});
		}
		else this.#io?.emit(channel, message);
	}

	/**
	 * Dispatches a player message with ack request. Must be handled as a request on the Client side
	 * @param message 
	 * @param timeout 
	 * @param channel 
	 * @param playerId 
	 * @returns 
	 */
	async #makeRequest(message:DuneServerEvent, timeout: number, channel: string, playerId: string): Promise<DuneServerResponse> {
		return new Promise(res => {
				this.#playerList[playerId].socket.timeout(timeout).emit(channel, message, (err: GenericJson, response: GenericJson) => {
					message.response = err
						? { status: false, error: new DuneError(ERROR.PLAYER_RESPONSE_TIMEOUT, [ playerId, `${timeout}` ]) }
						: { status: true, data: response }
					res(new DuneServerResponse(message));
				});
		});
	}

	/**
	 * Send a request to one or more players. If no to[] array is supplied on the event, it will be emitted to all players
	 * This will bundle all responses together.
	 * To receive responses as they come in, call this function multiple times instead of supplying an array of ids
	 * 
	 * @param message 
	 * @param timeout 
	 * @param channel 
	 * @returns 
	 */
	async sendPlayerRequest(message: DuneServerEvent, channel = 'request'): Promise<DuneServerResponse[]> {
		const timeout = message.timeout ?? this.#config?.requestTimeout ?? 10000;
		const targetPlayerIds = !message.to?.length
			? this.allPlayerIds
			: message.to;
		return await Promise.all(targetPlayerIds.map(id => this.#makeRequest(message, timeout, channel, id)));
	}

}