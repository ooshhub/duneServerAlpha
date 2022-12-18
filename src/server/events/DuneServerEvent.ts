import { DuneError } from "../errors/DuneError";
import { ERROR } from "../errors/errors";

export type ReplyAddress = {
	domain: 'server',
	id: string,
};

export enum DuneEventType {
	EVENT = 'event',
	REQUEST = 'request',
	RESPONSE = 'response',
}

type DuneServerEventConstruction = {
	eventName: string, 
	eventData?: GenericJson, 
	reply?: ReplyAddress, 
	type?: DuneEventType, 
	to?: string[]|null, 
	timeout?: number,
	created_at?: number, 
	received_at?: number, 
	response_at?: number,
	response?: GenericJson,
};

export class DuneEvent {

  constructor(
			{ 
				eventName,
				eventData, 
				reply, 
				type 
			}
			:{
				eventName: string, 
				eventData?: GenericJson|undefined, 
				reply?: ReplyAddress|undefined, 
				type?: DuneEventType 
			} | DuneEvent
	)	{
    if (!eventName) throw new Error(`${this.constructor.name} error: Must supply an event name`);
    this.eventName = eventName ?? 'lostEvent';
    this.eventData = eventData ?? {};
		this.reply = reply;
		this.type = type ?? DuneEventType.EVENT;
  }

  eventData?: GenericJson|undefined;
  eventName: string;
	reply?: ReplyAddress|undefined;
  type?: DuneEventType;

}

export class DuneServerEvent extends DuneEvent {

	constructor(
			{
				eventName, 
				eventData, 
				reply, 
				type, 
				to, 
				timeout,
				created_at, 
				received_at, 
				response_at
			}
			:DuneServerEventConstruction | DuneServerEvent
	)	{
		super({ eventName, eventData, reply, type })
    if (!eventName) throw new Error(`${this.constructor.name} error: Must supply an event name`);
    this.eventName = eventName ?? 'lostEvent';
    this.eventData = eventData ?? {};
		this.reply = reply;
		this.type = type ?? DuneEventType.EVENT;
		this.to = to ?? [];
		this.timeout = timeout ?? 10000;
		this.created_at = created_at ?? Date.now();
		this.received_at = received_at ?? null;
		this.response_at = response_at ?? null;
  }

	eventName: string;
  eventData?: GenericJson;
	reply?: ReplyAddress;
  type?: DuneEventType;
	to?: string[]|null;
	timeout?: number;
	created_at?: number;
	received_at?: number|null;
	response_at?: number|null;
	response?: GenericJson;
}

/**
 * Helper constructor to create a request
 */
export class DuneServerRequest extends DuneServerEvent {

  constructor(
		{ eventName, eventData, reply, to, timeout, created_at }
		:DuneServerEventConstruction | DuneServerEvent
	)	{
		super({ eventName, eventData, reply, type: DuneEventType.REQUEST, to, timeout, created_at });
	}

}

export class DuneServerResponse extends DuneServerEvent {

	constructor(
		{ eventName, eventData, reply, to, timeout, created_at, received_at, response_at, response }
		:DuneServerEventConstruction | DuneServerEvent
	)	{
		response_at = response_at ?? Date.now();
		super({ eventName, eventData, reply, type: DuneEventType.RESPONSE, to, timeout, created_at, received_at, response_at });
		this.response = response ?? { status: null, data: new DuneError(ERROR.EMPTY_RESPONSE) }
	}

	response: GenericJson;

}