import { EventHandlerType } from "../../events/DuneEventHub.js";
import { DuneServerEvent, DuneServerResponse } from "../../events/DuneServerEvent.js";
import { DuneEventHandler } from "../../net/SocketServer.js";

export type LocalHubConfig = {
	name: string,
}

export interface LocalHubContract {
	on: (eventName: string, callback: DuneEventHandler) => void;
	once: (eventName: string, callback: DuneEventHandler) => void;
	remove: (eventName: string, handlerType: EventHandlerType, callback: DuneEventHandler) => void;
	trigger: (eventOrEventName: string|DuneServerEvent, eventData?: GenericJson) => Promise<void>;
	request: (eventOrEventName: string|DuneServerEvent, eventData?: GenericJson, timeout?: number) => Promise<DuneServerResponse>;
}