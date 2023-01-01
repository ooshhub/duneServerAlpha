import { mkdir } from "fs";
import { EnvironmentKeys } from "../config/EnvironmentKeyTypes.js";
import { DuneError } from "../errors/DuneError.js";
import { ERROR } from "../errors/errors.js";

export enum PathTo {
	STORAGE = 'storage',
	LOGS = 'logs',
}

export class PathHelper {

	constructor() { throw new DuneError(ERROR.NO_INSTANTIATION, [ this.constructor.name ]); }

	static #basePath = '';

	static #storagePath = '';
	static #logsPath = '';

	static boot(basePath: string): void {
		// Set up paths
		PathHelper.#basePath = basePath;
		PathHelper.#storagePath = env(EnvironmentKeys.STORAGE_PATH) as string;
		PathHelper.#logsPath = env(EnvironmentKeys.LOGS_PATH) as string;

		// Attach global helpers
		global.path = PathHelper.getPath;

		// Check if paths exist
		PathHelper.#findOrCreatePaths();
	}

	static #findOrCreatePaths() {
		Object.values(PathTo).forEach((shortcut) => {
			const path = PathHelper.getPath(shortcut);
			mkdir(path, { recursive: true }, (err) => {
				if (err) throw new DuneError(ERROR.COULD_NOT_CREATE_FOLDER, [ path ]);
			});
		});
	}

	static #resolveShortcut(shortcut: string): string {
		switch(shortcut) {
			case(PathTo.STORAGE): {
				return PathHelper.#storagePath;
			}
			case(PathTo.LOGS): {
				return PathHelper.#logsPath;
			}
			default: {
				return '';
			}
		}
	}

	static #joinPaths(path1: string, path2: string): string {
		const joinedPaths = `${path1}/${path2}`;
		return joinedPaths.replace(/[/\\]+/g, '/');
	}

	static getPath(basePath: PathTo|string, endPath?: string): string {
		let path = PathHelper.#joinPaths(PathHelper.#basePath, (Object.values(PathTo) as string[]).includes(basePath)
			? PathHelper.#resolveShortcut(basePath)
			: basePath
		);
		path = endPath
			? PathHelper.#joinPaths(path, endPath)
			: path;
		return /\/$/.test(path)
			? path
			: `${path}/`;
	}

}