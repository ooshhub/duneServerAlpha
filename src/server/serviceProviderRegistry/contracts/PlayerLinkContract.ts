import { DuneServerEvent, DuneServerResponse } from "../../events/DuneServerEvent";
import { DuneEventHandler, HostOptions, ServerOptions, SocketServerObserverType } from "../../net/SocketServer";

export interface PlayerLinkContract {
	setupServer: (serverOptions: ServerOptions, playerDetails: HostOptions) => void;
	startServer: () => void;
	sendPlayerMessage: (duneServerEvent: DuneServerEvent, channel?: string) => Promise<void>;
	sendPlayerRequest: (duneServerEvent: DuneServerEvent, channel?: string) => Promise<DuneServerResponse[]>;
	registerObserver: (observerType: SocketServerObserverType, handler: DuneEventHandler) => void;
	removeObserver: (observerType: SocketServerObserverType, handler: DuneEventHandler) => void;
}