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
import { ConfigKeys, ConfigKeyTypes } from "../config/ConfigKeyTypes.js";
import { ConfigValueTypes, EnvironmentKeys, EnvironmentKeyTypes, KeyTypes } from "../config/EnvironmentKeyTypes.js";
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

	static boot(): CommandLineOptionCollection {
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
		const { validEnvironmentVariables,	commandLineOptions } = ProcessCommandLineInterface.processArguments(commandLineArguments);
		Object.assign(newConfig, ...validEnvironmentVariables);

		this.#environmentConfig = newConfig;

		// Load default writeable config values
		for (const key in ConfigKeyTypes) {
			ConfigManager.#writeableConfig[key] = ConfigKeyTypes[key].default;
		}

		// Initialise global config getter methods
		global.env = ConfigManager.getEnvironmentKey;
		global.config = ConfigManager.accessConfigKey;

		// Complete the boot process and return any supervisor orders
		ConfigManager.#booted = true;
		return commandLineOptions;

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

export type CommandLineOptionCollection = CommandLineOption[]

type ProcessedCommandLine = {
	validEnvironmentVariables: CommandLineOptionCollection,
	commandLineOptions: CommandLineOptionCollection
}
type CommandLineOption = { [key: string]: any }

/**
 * Process arguments supplied in command line when launching process
 */
class ProcessCommandLineInterface {

	constructor() { throw new DuneError(ERROR.NO_INSTANTIATION, [ this.constructor.name ]); }

	static #commandLinePrefix = /^--/;

	// Consume Environment varables and leave the rest to be dealt with as CLI options
	static processArguments(argvArray: string[]): ProcessedCommandLine {
		const { validEnvironmentVariables, commandLineOptions } = argvArray.reduce((output, arg) => {
			if (ProcessCommandLineInterface.#commandLinePrefix.test(arg)) {
				const [ key, value ] = arg.trim().replace(this.#commandLinePrefix, '').split(/=/);
				if (value && key in EnvironmentKeys) {
					const typedValue = ConfigHelpers.processConfigKeyValue(EnvironmentKeyTypes[key].keyType, value);
					output.validEnvironmentVariables.push({ [key]: typedValue });
				}
				else if (value && key in ConfigKeys) {
					const typedValue = ConfigHelpers.processConfigKeyValue(ConfigKeyTypes[key].keyType, value);
					output.commandLineOptions.push({ [key]: typedValue });
				}
				else {
					output.commandLineOptions.push({ [key]: `${value}` });
				}
			}
			return output;
		}, { validEnvironmentVariables: [] as CommandLineOptionCollection, commandLineOptions: [] as CommandLineOptionCollection } );
		return {
			validEnvironmentVariables,
			commandLineOptions,
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
			case(KeyTypes.NUMBER): {
				return parseFloat(value);
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