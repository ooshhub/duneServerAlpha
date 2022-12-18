// global types

import { ConsoleLoggingInterface } from "../server/serviceProviderRegistry/interfaces/ConsoleLoggingInterface";

declare global {

	type Neutralino = { [key: string]: string };

	type GenericFunction = (...args: any[]) => void;

	type GenericJson = { [key: string]: any }

	namespace globalThis {
		var logger: ConsoleLoggingInterface;
	}

}

export {};

