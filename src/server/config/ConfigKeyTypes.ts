import { ConfigKeyCollection, KeyTypes } from "./EnvironmentKeyTypes.js";

// Writeable config keys
export const ConfigKeyTypes: ConfigKeyCollection = {
	testKey: {
		keyType: KeyTypes.STRING,
		default: 'production',
	},
}