import { DuneError } from "../../errors/DuneError.js";
import { DuneServerEvent, DuneServerResponse } from "../../events/DuneServerEvent.js";
import { DuneEventHandler, HostOptions, ServerOptions, SocketServerObserverType } from "../../net/SocketServer.js";

export type SocketServerConfig = {
	name: string,
}

export interface PlayerLinkContract {
	setupServer: (serverOptions: ServerOptions, playerDetails: HostOptions) => void;
	startServer: () => void;
	sendPlayerMessage: (duneServerEvent: DuneServerEvent, channel?: string) => Promise<void>;
	sendPlayerRequest: (duneServerEvent: DuneServerEvent, channel?: string) => Promise<DuneServerResponse[]>;
	registerObserver: (observerType: SocketServerObserverType, handler: DuneEventHandler) => void;
	removeObserver: (observerType: SocketServerObserverType, handler: DuneEventHandler) => void;

	requestRestart: (secret: string) => Promise<string | DuneError>;
}