import { readFile } from "fs/promises";
import { LocalStorageContract } from "../contracts/LocalStorageContract";
import { DuneError } from "../errors/DuneError";

export type FileManagerConfig = {
	name: string
}


export class NodeFileManager implements LocalStorageContract {

	#jobQueue = [];

	constructor(fileManagerConfig?: FileManagerConfig) {
		this.name = fileManagerConfig?.name ?? 'fileManager';
	}

	name;

	#startIoJob(pathToFile: string) {

	}

	async #fetchFile

	async readLocalFile(pathToFile: string): Promise<string|DuneError> {
		const fileContents = readFile(pathToFile, { encoding: 'utf-8' })
			.catch(response => {
			
		})
	}
}