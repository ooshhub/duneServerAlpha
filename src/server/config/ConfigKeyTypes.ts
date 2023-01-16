import { ConfigKeyCollection, KeyTypes } from "./EnvironmentKeyTypes.js";

export enum ConfigKeys {
  PORT    = 'PORT',
  RESTART = 'RESTART',
}

// Writeable config keys
export const ConfigKeyTypes: ConfigKeyCollection = {
  [ConfigKeys.PORT]: {
    keyType: KeyTypes.NUMBER,
    default: 3333,
  },
  [ConfigKeys.RESTART]: {
    keyType: KeyTypes.STRING,
    default: '',
  }
}