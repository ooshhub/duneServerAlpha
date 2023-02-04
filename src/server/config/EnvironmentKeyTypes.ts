export enum KeyTypes {
  INTEGER  = 'integer',
  FLOAT    = 'float',
  STRING   = 'string',
  BOOLEAN  = 'boolean',
  NUMBER   = 'number',
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
  ENVIRONMENT     = 'ENVIRONMENT',
  RESTART_SECRET  = 'REQUEST_RESTART',
  MODE            = 'MODE',
  STORAGE_PATH    = 'STORAGE_PATH',
  LOGS_PATH       = 'LOGS_PATH',
}

// Immutable environment keys
export const EnvironmentKeyTypes: ConfigKeyCollection = {
  [EnvironmentKeys.ENVIRONMENT]: {
    keyType: KeyTypes.STRING,
    default: 'production',
  },
  [EnvironmentKeys.MODE]: {
    keyType: KeyTypes.STRING,
    default: '',
  },
  [EnvironmentKeys.STORAGE_PATH]: {
    keyType: KeyTypes.STRING,
    default: 'storage/',
  },
  [EnvironmentKeys.LOGS_PATH]: {
    keyType: KeyTypes.STRING,
    default: 'storage/logs/',
  },
  [EnvironmentKeys.RESTART_SECRET]: {
    keyType: KeyTypes.STRING,
    default: '',
  }

}