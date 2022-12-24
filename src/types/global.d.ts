// global types

import { ConsoleLoggingContract } from "../server/serviceProviderRegistry/contracts/ConsoleLoggingContract";

declare global {

	type Neutralino = { [key: string]: string };

	type GenericFunction = (...args: any[]) => void;

	type GenericJson = { [key: string]: any }

	namespace globalThis {
		var logger: ConsoleLoggingContract;
	}

}

export {};

