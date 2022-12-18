/**
 * Things this needs to do
 * - send events to players. Will need to use the Directory service for this
 * - send server events over localhub
 * - handle requests - both player requests via playerLinkService and local request via the hub
 * - wrap requests in a DuneEvent if required
 * 
 * 
 * dispatch('updatePlayerList')
 * dispatchRequest('players/cardOpportunity')
 * 
*/

import { DuneError } from "../errors/DuneError";
import { ERROR } from "../errors/errors";
import { PlayerLinkInterface } from "../serviceProviderRegistry/interfaces/PlayerLinkInterface";
import { DuneServerEvent, DuneServerResponse } from "./DuneServerEvent";

export enum EventDomains {
	PLAYERS = 'players',
	SERVER = 'server',
}

export class DuneEventDispatcher {

	#playerLinkService: PlayerLinkInterface;
	#localHubService: LocalHubInterface;

	constructor(dispatcherConfig: GenericJson = {}, playerLinkService: PlayerLinkInterface, localHubService: LocalHubInterface) {
		this.name = dispatcherConfig.name || 'duneEventDispatcher';
		this.#playerLinkService = playerLinkService;
		this.#localHubService = localHubService;
	}

	name: string;

	/**
	 * Create a new event from either:
	 * 	- JS style event, { 'event-name-as-string', { eventDataObject } }
	 * 	- A DuneEvent received from client which will just have been deserialized
	 * 
	 * @param eventNameOrData
	 * @param eventData 
	 * @returns 
	 */
	#createEvent(eventNameOrData: string|GenericJson, eventData?: GenericJson): DuneServerEvent | null {
		const data = typeof(eventNameOrData) === 'object'
			? eventNameOrData
			: { eventName: eventNameOrData, eventData: eventData };
		if (typeof(data) !== 'object' || !data.eventName) return null;
		Object.assign(data, {
			reply: { domain: 'server', id: 0 },
			type: 'DuneServerEvent',
		});
		return new DuneServerEvent(data as { eventName: string });
	}

	/**
	 * Dispatch an event to either the local hub or the connected clients
	 * 
	 * @param domain 
	 * @param eventNameOrDuneEvent 
	 * @param duneEvent 
	 */
	async dispatchEvent(domain: EventDomains, eventNameOrDuneEvent: string|DuneServerEvent, duneEvent?: DuneServerEvent): Promise<void> {
		const event = eventNameOrDuneEvent instanceof DuneServerEvent
			? eventNameOrDuneEvent
			: this.#createEvent(eventNameOrDuneEvent, duneEvent);
		if (!event) throw new DuneError(ERROR.BAD_EVENT_DATA);
		if (domain === EventDomains.PLAYERS) {
			this.#playerLinkService.sendPlayerMessage(event);
		}
		else if (domain === EventDomains.SERVER) {
			this.#localHubService.trigger(event);
		}
		else throw new DuneError(ERROR.BAD_EVENT_DOMAIN, [ domain ]);
	}

	/**
	 * Dispatch a request to either the local hub or the connected clients
	 * Returns an array of DuneServerResponse objects
	 * These contain the original event, and a response key containing the response or error
	 * 
	 * @param domain 
	 * @param eventNameOrDuneEvent 
	 * @param duneEvent 
	 * @returns 
	 */
	async dispatchRequest(domain: EventDomains, eventNameOrDuneEvent: string|DuneServerEvent, duneEvent?: DuneServerEvent): Promise<DuneServerResponse[]> {
		const event = eventNameOrDuneEvent instanceof DuneServerEvent
			? eventNameOrDuneEvent
			: this.#createEvent(eventNameOrDuneEvent, duneEvent);
		if (!event) throw new DuneError(ERROR.BAD_EVENT_DATA);
		if (domain === EventDomains.PLAYERS) return this.#playerLinkService.sendPlayerRequest(event);
		else if (domain === EventDomains.SERVER) return this.#localHubService.request(event);
		else throw new DuneError(ERROR.BAD_EVENT_DOMAIN, [ domain ]);
	}
}