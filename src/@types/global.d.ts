// global types

import { PathTo } from "../server/app/PathHelper.js";
import { ConfigValueTypes } from "../server/config/EnvironmentKeyTypes.js";
import { EventDomains } from "../server/events/DuneEventDispatcher.js";
import { DuneServerEvent, DuneServerResponse } from "../server/events/DuneServerEvent.js";
import { ConsoleLoggingContract } from "../server/serviceProviderRegistry/contracts/ConsoleLoggingContract.js";
import { PlayerDirectoryServiceContract } from "../server/serviceProviderRegistry/contracts/PlayerDirectoryServiceContract.js";

declare global {

	type Neutralino = { [key: string]: string };

	type GenericFunction = (...args: any[]) => void;

	type GenericJson = { [key: string]: any }

	namespace globalThis {
		var logger: ConsoleLoggingContract;
		var playerDirectory: PlayerDirectoryServiceContract;
		var dispatch: (domain: EventDomains, eventNameOrDuneEvent: string|DuneServerEvent, duneEvent?: DuneServerEvent) => Promise<void>;
		var request: (domain: EventDomains, eventNameOrDuneEvent: string|DuneServerEvent, duneEvent?: DuneServerEvent) => Promise<DuneServerResponse[]>;
		var env: (keyName: string) => ConfigValueTypes|undefined;
		var config: (keyName: string, newValue?: any) => ConfigValueTypes|undefined;
		var path: (basePath: PathTo|string, endPath?: string) => string;
	}

}

export {};

