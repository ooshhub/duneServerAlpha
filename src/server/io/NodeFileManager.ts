import { readFile } from "fs/promises";
import { LocalStorageContract } from "../contracts/LocalStorageContract";
import { DuneError } from "../errors/DuneError";

export type FileManagerConfig = {
	name: string
}


export class NodeFileManager implements LocalStorageContract {

	#activeJobs = {};
	#jobQueue: string[] = [];

	#queueLock = false;

	constructor(fileManagerConfig?: FileManagerConfig) {
		this.name = fileManagerConfig?.name ?? 'fileManager';
	}

	name;

	async #queueIsUnlocked(timeout = 5000): Promise<boolean> {
		return new Promise((res, rej) => {
			if (!this.#queueLock) res(true);
			else {
				const awaitLock = setInterval(() => {
					if (!this.#queueLock) {
						clearInterval(awaitLock);
						res(true);
					}
					timeout -= 1;
					if (timeout < 0) {
						rej(new DuneError())
					}
				}, 1);
			}
	}

	#cleanPath(path: string): string {
		return path.replace(/[\/\\]/, '-').replace(/[^0-z._-]/, '');
	}

	async #addJobToQueue(path: string): Promise<void> { this.#jobQueue.push(this.#cleanPath(path));	}

	async #startIoJob(pathToFile: string) {
		if (await this.#queueIsUnlocked) {

		}
	}

	async #fetchFile(path: string): Promise<string|DuneError> {

	}

	async readLocalFile(pathToFile: string): Promise<string|DuneError> {
		
	}
}