import { DuneError } from "../errors/DuneError";
import { ERROR } from "../errors/errors";
import { DuneEventHandler } from "../net/SocketServer"
import { LocalHubContract } from "../serviceProviderRegistry/contracts/LocalHubContract";
import { Helpers } from "../utils/Helpers";
import { EventDomains } from "./DuneEventDispatcher";
import { DuneEventType, DuneServerEvent, DuneServerRequest, DuneServerResponse } from "./DuneServerEvent";

type EventRegistry = { [eventName: string]: DuneEventHandler[] }

export enum EventHandlerType {
	ONCE = 'once',
	ON = 'on,'
}

export class DuneEventHub implements LocalHubContract {

	#registeredEvents: EventRegistry = {};
	#registeredOneTimeEvents: EventRegistry = {};

	#name = 'DuneEventHub';

	constructor(eventHubConfig: GenericJson = {}) {
		this.#name = eventHubConfig.name || this.#name;
	}

	get name(): string { return this.#name }
	get registeredEvents(): string[] { return Object.keys(this.#registeredEvents); }

	#registerHandler(eventName: string, callback: DuneEventHandler, targetEvents: EventRegistry = this.#registeredEvents): void {
    if (!(eventName in targetEvents)) targetEvents[eventName] = [ callback ];
    else targetEvents[eventName].push(callback);
  }

	/**
	 * Register an event handler with the hub
	 * @param eventName
	 * @param callback 
	 */
	on(eventName: string, callback: DuneEventHandler): void {
		this.#registerHandler(eventName, callback, this.#registeredEvents);
  }

	/**
	 * Register a one-time event handler with the hub
	 * @param eventName 
	 * @param callback 
	 */
	once(eventName: string, callback: DuneEventHandler): void {
		this.#registerHandler(eventName, callback, this.#registeredOneTimeEvents);
  }

	/**
	 * Remove an event handler from the hub
	 * @param eventName 
	 * @param handlerType 
	 * @param callback 
	 */
	remove(eventName: string, handlerType: EventHandlerType, callback: DuneEventHandler): void {
		const targetEvents = handlerType === EventHandlerType.ONCE
			? this.#registeredOneTimeEvents[eventName]
			: this.#registeredEvents[eventName];
		if (targetEvents) {
			Helpers.filterInPlace(targetEvents, handler => handler !== callback);
		}
	}

	#createNewDuneEvent(eventName: string, eventData: GenericJson): DuneServerEvent {
		return new DuneServerEvent({
			eventName,
			eventData: eventData ?? {},
			reply: { domain: EventDomains.SERVER, id: '0' },
			type: DuneEventType.EVENT,
		});
	}

	async #sendOneTimeEvent(event: DuneServerEvent): Promise<void> {
		if (this.#registeredOneTimeEvents[event.eventName]?.length) {
			this.#registeredOneTimeEvents[event.eventName].forEach(handler => {
				handler(event);
			});
			this.#registeredOneTimeEvents[event.eventName] = [];
		}
	}

	async #sendEvent(event: DuneServerEvent): Promise<void> {
		if (this.#registeredOneTimeEvents[event.eventName]?.length) {
			this.#registeredOneTimeEvents[event.eventName].forEach(handler => {
				handler(event);
			});
		}
	}

	/**
	 * Trigger an event on the local hub
	 * Provide either a single DuneEvent, or (eventName, eventData)
	 * @param {string|DuneServerEvent} eventNameOrData 
	 * @param {GenericJson?} eventData
	 */
	async trigger(eventOrEventName: string|DuneServerEvent, eventData?: GenericJson): Promise<void> {
		const duneEvent = typeof(eventOrEventName) === 'string'
			? this.#createNewDuneEvent(eventOrEventName, eventData ?? {})
			: eventOrEventName;
		this.#sendOneTimeEvent(duneEvent);
		this.#sendEvent(duneEvent);
	}

	/**
	 * Make a request across the local hub.
	 * Target event must have a request handler in order to reply
	 * @param eventOrEventName 
	 * @param eventData 
	 * @param timeout 
	 * @returns 
	 */
	async request(eventOrEventName: string|DuneServerEvent, eventData?: GenericJson, timeout?: number): Promise<DuneServerResponse> {
		const duneEvent = typeof(eventOrEventName) === 'string'
			? this.#createNewDuneEvent(eventOrEventName, eventData ?? {})
			: eventOrEventName;
		const requestId = Helpers.generateUID();
		const duneRequest = new DuneServerRequest({ ...duneEvent, timeout, reply: { domain: EventDomains.SERVER, id: requestId} });

		const duneResponse: Promise<DuneServerEvent|GenericJson> = new Promise(res => {
			this.once(requestId, response => res(response));
		});
		this.trigger(duneRequest);
		
		const result = await Promise.race([
			duneResponse,
			Helpers.timeout(duneRequest.timeout ?? 5000),
		]);
		const responseObject = result
			? { status: true, data: result }
			: { status: false, error: new DuneError(ERROR.REQUEST_TIMEOUT, [ duneEvent.eventName ] ) };
		return new DuneServerResponse({ ...duneEvent, response: responseObject });
	}


}