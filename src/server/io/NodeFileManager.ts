import { readFile, writeFile } from "fs/promises";
import { LocalStorageContract } from "../contracts/LocalStorageContract.js";
import { DuneError } from "../errors/DuneError.js";
import { ERROR } from "../errors/errors.js";
import { Helpers } from "../utils/Helpers.js";

export type FileManagerConfig = {
	name: string,
	basePath: string,
}

enum FileIoJobTypes {
	READ 	= 'read',
	WRITE = 'write',
}

enum QueueStatus {
	IDLE	= 'idle',
	BUSY	= 'busy',
	ERROR	= 'error',
}

type FileJobObserver = (result: boolean, data?: string, error?: DuneError) => Promise<void>;

type FileIoJob = {
	type: FileIoJobTypes,
	path: string,
	completed?: boolean,
	observer: FileJobObserver,
	data?: string,
}


export class NodeFileManager implements LocalStorageContract {

	#activeJobs: string[] = [];
	#jobQueue: FileIoJob[] = [];

	#queueLock = false;

	#queueStatus: QueueStatus = QueueStatus.IDLE;

	constructor(fileManagerConfig?: FileManagerConfig) {
		this.name = fileManagerConfig?.name ?? 'fileManager';
		this.#basePath = fileManagerConfig?.basePath?.trim().replace(/[\/\\\s]*/, '') ?? './';
	}

	name;
	#basePath;

	#resolvePath(path: string) {
		const cleanPath = path.replace(/^[\/\\\s]*/, '');
		return `${this.#basePath}/${cleanPath}`
	}

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
						clearInterval(awaitLock);
						rej(false);
					}
				}, 1);
			}
		});
	}

	#cleanPathName(path: string): string {
		return path.trim().toLowerCase();
	}

	async #fileAvailable(path: string, timeout = 1000): Promise<boolean> {
		const cleanName = this.#cleanPathName(path);
		if (!this.#activeJobs.includes(cleanName)) return true;
		else {
			return new Promise(res => {
				const awaitFile = setInterval(() => {
					if (!this.#activeJobs.includes(cleanName)) {
						clearInterval(awaitFile);
						res(true);
					}
					else {
						if (timeout < 1) {
							clearInterval(awaitFile);
							res(false);
						}
						timeout -= 1;
					}
				}, 1);
			});
		}
	}

	async #addJobToQueue(newJob: FileIoJob): Promise<void> {
		newJob.completed = false;
		this.#jobQueue.push(newJob);
		if (this.#queueStatus === QueueStatus.IDLE) this.#startQueue();
	}

	async #startIoJob(newJob: FileIoJob) {
		if (await this.#queueIsUnlocked()) {
			this.#addJobToQueue(newJob);
		}
	}

	async #cleanQueue(): Promise<void> {
		this.#queueLock = true;
		Helpers.filterInPlace(this.#jobQueue, job => job && !job.completed);
		this.#queueLock = false;
	}

	#completeJob(finishedJob: FileIoJob): void {
		finishedJob.completed = true;
		const cleanPath = this.#cleanPathName(finishedJob.path);
		Helpers.filterInPlace(this.#activeJobs, jobName => jobName !== cleanPath);
	}

	async #startQueue() {
		await this.#cleanQueue();
		if (this.#jobQueue.length) this.#processQueue();
	}

	async #processQueue() {
		this.#queueStatus = QueueStatus.BUSY;
		let i = 0;
		while (this.#jobQueue[i]) {
			const currentJob = this.#jobQueue[i];
			if (!currentJob.completed) {
				if (await this.#fileAvailable(currentJob.path)) {
					if (currentJob.type === FileIoJobTypes.READ) {
						await readFile(currentJob.path, { encoding: 'utf-8' })
							.then(response => {
								currentJob.observer(true, response);
							}).catch(err => {
								currentJob.observer(false, undefined, new DuneError(err));
							}).finally(() => this.#completeJob(currentJob));
					}
					else if (currentJob.type === FileIoJobTypes.WRITE) {
						await writeFile(currentJob.path, currentJob.data ?? '')
							.then(() => {
								currentJob.observer(true);
							}).catch(err => {
								currentJob.observer(false, undefined, new DuneError(err));
							}).finally(() => this.#completeJob(currentJob));
					}
					else throw new DuneError(ERROR.IO_JOB_TYPE_UNKNOWN, [ currentJob.type ]);
				}
			}
			i++;
		}
		await this.#cleanQueue();
		if (this.#jobQueue.length) this.#processQueue;
		else {
			this.#queueStatus = QueueStatus.IDLE;
		}
	}

	/**
	 * Read a local file, return contents as string
	 * @param {string} pathToFile - relative path from base path
	 * @returns {string|DuneError}
	 */
	async readLocalFile(pathToFile: string): Promise<string|DuneError> {
		return new Promise((res, rej) => {
			const observer = async (jobCompleted: boolean, fileContents?: string, error?: DuneError) => {
				if (jobCompleted && fileContents) res(fileContents);
				else rej(error ?? new DuneError(ERROR.FILE_READ_ERROR, [ pathToFile ]));
			}
			this.#startIoJob({
				type: FileIoJobTypes.READ,
				path: this.#resolvePath(pathToFile),
				observer,
			});
		});
	}

	#handleWriteData(data: string|object): string|null {
		let jsonString = null;
		if (typeof(data) === 'object') {
			try { jsonString = JSON.stringify(data); }
			catch(e) {}
			return jsonString;
		}
		else return data;
	}

	/**
	 * Write to a local file
	 * @param data 
	 * @returns 
	 */
	async writeLocalFile(pathToFile: string, data: string|object): Promise<true|DuneError> {
		const dataString = this.#handleWriteData(data);
		if (!dataString) return new DuneError(ERROR.BAD_WRITE_DATA);
		return new Promise((res, rej) => {
			const observer = async (jobCompleted: boolean, fileContents?: string, error?: DuneError) => {
				if (jobCompleted) res(jobCompleted);
				else rej(error ?? new DuneError(ERROR.FILE_READ_ERROR, [ pathToFile ]));
			}
			this.#startIoJob({
				type: FileIoJobTypes.WRITE,
				path: this.#resolvePath(pathToFile),
				data: dataString,
				observer,
			});
		});
	}

/**
 * HELPER FUNCTIONS
 */

	/** TODO: Implement once paths and naming conventions are set */
	async readSave(saveGameName: string): Promise<string|DuneError> { return 'blah' }

	/** TODO: Implement once paths and naming conventions are set */
	async writeSave(saveGameName: string, data: string|object): Promise<boolean|DuneError> { return false }

	/** TODO: Implement once paths and naming conventions are set */
	async readConfig(saveGameName: string): Promise<string|DuneError> { return 'blah' }

	/** TODO: Implement once paths and naming conventions are set */
	async writeConfig(saveGameName: string, data: string|object): Promise<boolean|DuneError> { return false }

}