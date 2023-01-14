import { ConfigKeyCollection, KeyTypes } from "./EnvironmentKeyTypes.js";

export enum ConfigKeys {
	PORT			= 'PORT',
}

// Writeable config keys
export const ConfigKeyTypes: ConfigKeyCollection = {
	[ConfigKeys.PORT]: {
		keyType: KeyTypes.NUMBER,
		default: 3333,
	},
}