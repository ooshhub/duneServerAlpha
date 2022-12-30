export enum KeyTypes {
	INTEGER	= 'integer',
	FLOAT		= 'float',
	STRING  = 'string',
	BOOLEAN	= 'boolean',
}

export type ConfigValueTypes = number|string|boolean|null;

export type ConfigKey = {
		keyType: KeyTypes,
		default: ConfigValueTypes,
}

export type ConfigKeyCollection = {
	[keyName: string]: ConfigKey
}

export enum EnvironmentKeys {
	ENVIRONMENT 	= 'ENVIRONMENT',
	STORAGE_PATH	= 'STORAGE_PATH',
	LOGS_PATH			= 'LOGS_PATH',
}

// Immutable environment keys
export const EnvironmentKeyTypes: ConfigKeyCollection = {
	[EnvironmentKeys.ENVIRONMENT]: {
		keyType: KeyTypes.STRING,
		default: 'production',
	},
	[EnvironmentKeys.STORAGE_PATH]: {
		keyType: KeyTypes.STRING,
		default: 'storage/',
	},
	[EnvironmentKeys.LOGS_PATH]: {
		keyType: KeyTypes.STRING,
		default: 'storage/logs/',
	},

}