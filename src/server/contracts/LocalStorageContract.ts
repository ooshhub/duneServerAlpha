import { DuneError } from "../errors/DuneError";

export interface LocalStorageContract {
	readLocalFile: (pathToFile: string) => Promise<string|DuneError>;
	writeLocalFile: (pathToFile: string, data: string|object) => Promise<boolean|DuneError>;

	readSave: (saveGameName: string) => Promise<string|DuneError>;
	writeSave: (saveGameName: string, data: object) => Promise<boolean|DuneError>;

	readConfig: (configName: string) => Promise<string|DuneError>;
	writeConfig: (configName: string) => Promise<boolean|DuneError>;
}