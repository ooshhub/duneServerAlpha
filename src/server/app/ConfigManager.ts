/**
 * This class should:
 * 	- grab command line arguments
 * 	- grab .env variables
 * 	- combine these to create the active environment
 *  - export a helper (or helpers) for grabbing config values
 *  - split into separate categories as required
 * 	- have a debug command in the interface for checking values
 *  - have subordinate classes for processing the different kinds of config (cli and .env)
 * 
 * This class should not:
 * 	- expose sensitive config values
 * 	- allow writing to environment variables
 * 	- be accessible in any way from the client software
 */

import { CommandLineOrders } from "../config/CommandLineOrders.js";
import { ConfigKeyTypes } from "../config/ConfigKeyTypes.js";
import { ConfigValueTypes, EnvironmentKeyTypes, KeyTypes } from "../config/EnvironmentKeyTypes.js";
import { DuneError } from "../errors/DuneError.js";
import { ERROR } from "../errors/errors.js";
import { LogType } from "../utils/logger/ServerLogger.js";

type ConfigCollection = {
	[key: string]: string|boolean|number|null;
}

export class ConfigManager {

	static #booted = false;

	static #environmentConfig: ConfigCollection = {};

	static #writeableConfig: ConfigCollection = {};

	constructor() { throw new DuneError(ERROR.NO_INSTANTIATION, [ this.constructor.name ]); }

	static boot(): CommandLineOrderCollection {
		if (ConfigManager.#booted) {
			throw new DuneError(ERROR.CONFIG_ALREADY_BOOTED);
		}

		const commandLineArguments = process.argv;

		// Load default environment key values
		const newConfig: ConfigCollection = {};
		for (const prop in EnvironmentKeyTypes) {
			newConfig[prop] = EnvironmentKeyTypes[prop].default;
		}
		// Assign envirnoment file variables
		const envFileVariables: ConfigCollection = ProcessEnvironmentFile.processEnv();
		Object.assign(newConfig, envFileVariables);

		// Assign command line arguments
		const { environmentVariables,	commandLineOrders } = ProcessCommandLineInterface.processArguments(commandLineArguments);
		Object.assign(newConfig, environmentVariables);

		this.#environmentConfig = newConfig;

		// Load default writeable config values
		for (const key in ConfigKeyTypes) {
			ConfigManager.#writeableConfig[key] = ConfigKeyTypes[key].default;
		}

		// Initialise global config getter methods
		global.env = ConfigManager.getEnvironmentKey;
		global.config = ConfigManager.accessConfigKey;

		// Complete the boot process and return any supervisor orderss
		ConfigManager.#booted = true;
		return commandLineOrders;

	}

	static getEnvironmentKey(keyName: string): ConfigValueTypes|undefined {
		return keyName in ConfigManager.#environmentConfig
			? ConfigManager.#environmentConfig[keyName]
			: undefined;
	}

	static accessConfigKey(keyName: string, newValue?: any): ConfigValueTypes|undefined {
		if (newValue !== undefined) {
			if (keyName in ConfigKeyTypes) {
				if (typeof(newValue) === ConfigKeyTypes[keyName].keyType) {
					ConfigManager.#writeableConfig[keyName] = newValue;
					return newValue;
				}
				else {
					const err = new DuneError(ERROR.BAD_CONFIG_TYPE, [ keyName, `${newValue}`, ConfigKeyTypes[keyName].keyType ]);
					logger.warn(LogType.CI, err.message);
					return undefined;
				}
			}
			else {
				ConfigManager.#writeableConfig[keyName] = newValue;
				return newValue;
			}
		}
		else if (keyName in ConfigManager.#writeableConfig) {
			return ConfigManager.#writeableConfig[keyName];
		}
		else {
			const err = new DuneError(ERROR.CONFIG_KEY_NOT_FOUND, [ keyName ]);
			logger.warn(LogType.CI, err.message);
			return undefined;
		}
	}

}

class ProcessEnvironmentFile {

	constructor() { throw new DuneError(ERROR.NO_INSTANTIATION, [ this.constructor.name ]); }

	static processEnv(): ConfigCollection {
		const validKeys = Object.keys(EnvironmentKeyTypes);
		return validKeys.reduce((output, keyName) => {
			if (keyName in process.env) {
				const keyValue = ConfigHelpers.processConfigKeyValue(EnvironmentKeyTypes[keyName].keyType, process.env[keyName]);
				if (keyValue !== undefined) return { ...output, [keyName]: keyValue };
			}
			return output;
		}, {});
	}
}


type CommandLineEnvironmentVariables = {
	[key: string]: string|number|boolean|null
}
type CommandLineOrderCollection = {
	[command: string]: ArgumentsCollection
}
type ProcessedCommandLine = {
	environmentVariables: CommandLineEnvironmentVariables,
	commandLineOrders: CommandLineOrderCollection
}
type ArgumentsCollection = {
	[argName: string]: string
}
/**
 * Process arguments supplied in command line when launching process
 */
class ProcessCommandLineInterface {

	constructor() { throw new DuneError(ERROR.NO_INSTANTIATION, [ this.constructor.name ]); }

	static #environmentPrefix = /^--/;
	static #orderPrefix = /^-([A-z])/;

	static processArguments(argvArray: string[]): ProcessedCommandLine {
		const { validEnvironmentVariables, validCommandLineOrders } = argvArray.reduce((output, arg) => {
			if (ProcessCommandLineInterface.#environmentPrefix.test(arg)) { output.validEnvironmentVariables.push(arg) }
			else if (ProcessCommandLineInterface.#orderPrefix.test(arg)) { output.validCommandLineOrders.push(arg) }
			return output;
		}, { validEnvironmentVariables: [''], validCommandLineOrders: [''] } );

		const environmentVariables = validEnvironmentVariables.reduce((output, arg) => {
			const [ key, value ] = arg.replace(ProcessCommandLineInterface.#environmentPrefix, '').split(/=/);
			if (key in EnvironmentKeyTypes && value) {
				const newValue = ConfigHelpers.processConfigKeyValue(EnvironmentKeyTypes[key].keyType, value);
				return newValue === undefined
					? output
					: { ...output, [key]: value };
			}
			return output;
		}, { } );

		const commandLineOrders = validCommandLineOrders.reduce((output, arg) => {
			const commandArgs = arg.replace(ProcessCommandLineInterface.#orderPrefix, '$1').split(/-+/g);
			const order = commandArgs.shift()?.toLowerCase();
			if (order && order in CommandLineOrders) {
				const suppliedArgsObject: ArgumentsCollection = commandArgs.reduce((output, value) => {
					const [ commandArg, argValue ] = value.split('=');
					return commandArg && argValue
						? { ...output, [commandArg]: argValue }
						: output; 
				}, {});
				// Ensure all required args are present
				let validOrder = true;
				const validParameterOptions = CommandLineOrders[order].parameters;
				const finalArgs: ArgumentsCollection = {};
				for (let i = 0; i < validParameterOptions.length; i++) {
					const requiredParameter = /^\?/.test(validParameterOptions[i])
						? false
						: true;
					const cleanName = validParameterOptions[i].replace(/^\?/, '');
					if (requiredParameter && !(cleanName in suppliedArgsObject)) {
						validOrder = false;
						break;
					}
					else if (cleanName in suppliedArgsObject) {
						finalArgs[cleanName] = suppliedArgsObject[cleanName];
					}
				}
				if (validOrder) {
					return { ...output, [CommandLineOrders[order].command]: finalArgs };
				}
			}
			return output;
		}, { });

		return {
			environmentVariables,
			commandLineOrders,
		}

	}

}

class ConfigHelpers {

	static processConfigKeyValue(keyType: string, value: any) {
		switch(keyType) {
			case(KeyTypes.INTEGER): {
				return !/\D/.test(value)
					? parseInt(value)
					: undefined;
			}
			case(KeyTypes.FLOAT): {
				return !/[^\d.]/.test(value)
					? parseFloat(value)
					: undefined
			}
			case(KeyTypes.BOOLEAN): {
				return /^(true|on|1)$/i.test(value)
					? true
					: /^(false|off|0)$/i.test(value)
						? false
					: undefined;
			}
			case(KeyTypes.STRING): {
				return value
			}
			default: {
				return undefined;
			}
		}
	}

}