import { readFile, writeFile } from "fs/promises";
import { DuneError } from "../errors/DuneError.js";
import { ERROR } from "../errors/errors.js";
import { Helpers } from "../utils/Helpers.js";
var FileIoJobTypes;
(function (FileIoJobTypes) {
    FileIoJobTypes["READ"] = "read";
    FileIoJobTypes["WRITE"] = "write";
})(FileIoJobTypes || (FileIoJobTypes = {}));
var QueueStatus;
(function (QueueStatus) {
    QueueStatus["IDLE"] = "idle";
    QueueStatus["BUSY"] = "busy";
    QueueStatus["ERROR"] = "error";
})(QueueStatus || (QueueStatus = {}));
export class NodeFileManager {
    #activeJobs = [];
    #jobQueue = [];
    #queueLock = false;
    #queueStatus = QueueStatus.IDLE;
    constructor(fileManagerConfig) {
        this.name = fileManagerConfig?.name ?? 'fileManager';
        this.#basePath = fileManagerConfig?.basePath?.trim().replace(/[\/\\\s]*/, '') ?? './';
    }
    name;
    #basePath;
    #resolvePath(path) {
        const cleanPath = path.replace(/^[\/\\\s]*/, '');
        return `${this.#basePath}/${cleanPath}`;
    }
    async #queueIsUnlocked(timeout = 5000) {
        return new Promise((res, rej) => {
            if (!this.#queueLock)
                res(true);
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
    #cleanPathName(path) {
        return path.trim().toLowerCase();
    }
    async #fileAvailable(path, timeout = 1000) {
        const cleanName = this.#cleanPathName(path);
        if (!this.#activeJobs.includes(cleanName))
            return true;
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
    async #addJobToQueue(newJob) {
        newJob.completed = false;
        this.#jobQueue.push(newJob);
        if (this.#queueStatus === QueueStatus.IDLE)
            this.#startQueue();
    }
    async #startIoJob(newJob) {
        if (await this.#queueIsUnlocked()) {
            this.#addJobToQueue(newJob);
        }
    }
    async #cleanQueue() {
        this.#queueLock = true;
        Helpers.filterInPlace(this.#jobQueue, job => job && !job.completed);
        this.#queueLock = false;
    }
    #completeJob(finishedJob) {
        finishedJob.completed = true;
        const cleanPath = this.#cleanPathName(finishedJob.path);
        Helpers.filterInPlace(this.#activeJobs, jobName => jobName !== cleanPath);
    }
    async #startQueue() {
        await this.#cleanQueue();
        if (this.#jobQueue.length)
            this.#processQueue();
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
                    else
                        throw new DuneError(ERROR.IO_JOB_TYPE_UNKNOWN, [currentJob.type]);
                }
            }
            i++;
        }
        await this.#cleanQueue();
        if (this.#jobQueue.length)
            this.#processQueue;
        else {
            this.#queueStatus = QueueStatus.IDLE;
        }
    }
    async readLocalFile(pathToFile) {
        return new Promise((res, rej) => {
            const observer = async (jobCompleted, fileContents, error) => {
                if (jobCompleted && fileContents)
                    res(fileContents);
                else
                    rej(error ?? new DuneError(ERROR.FILE_READ_ERROR, [pathToFile]));
            };
            this.#startIoJob({
                type: FileIoJobTypes.READ,
                path: this.#resolvePath(pathToFile),
                observer,
            });
        });
    }
    #handleWriteData(data) {
        let jsonString = null;
        if (typeof (data) === 'object') {
            try {
                jsonString = JSON.stringify(data);
            }
            catch (e) { }
            return jsonString;
        }
        else
            return data;
    }
    async writeLocalFile(pathToFile, data) {
        const dataString = this.#handleWriteData(data);
        if (!dataString)
            return new DuneError(ERROR.BAD_WRITE_DATA);
        return new Promise((res, rej) => {
            const observer = async (jobCompleted, fileContents, error) => {
                if (jobCompleted)
                    res(jobCompleted);
                else
                    rej(error ?? new DuneError(ERROR.FILE_READ_ERROR, [pathToFile]));
            };
            this.#startIoJob({
                type: FileIoJobTypes.WRITE,
                path: this.#resolvePath(pathToFile),
                data: dataString,
                observer,
            });
        });
    }
    async readSave(saveGameName) { return 'blah'; }
    async writeSave(saveGameName, data) { return false; }
    async readConfig(saveGameName) { return 'blah'; }
    async writeConfig(saveGameName, data) { return false; }
}
