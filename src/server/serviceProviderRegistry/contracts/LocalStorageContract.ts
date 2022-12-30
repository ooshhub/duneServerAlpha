import { DuneError } from "../../errors/DuneError.js";

export type LocalStorageConfig = {
	name: string,
	basePath: string,
}

export interface LocalStorageContract {
	readLocalFile: (pathToFile: string) => Promise<string|DuneError>;
	writeLocalFile: (pathToFile: string, data: string|object) => Promise<boolean|DuneError>;

	readSave: (saveGameName: string) => Promise<string|DuneError>;
	writeSave: (saveGameName: string, data: string|object) => Promise<boolean|DuneError>;

	readConfig: (configName: string) => Promise<string|DuneError>;
	writeConfig: (configName: string, data: string|object) => Promise<boolean|DuneError>;
}