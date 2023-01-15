import { DuneError } from "../errors/DuneError.js";
import { ERROR } from "../errors/errors.js";
import { StdIoEventMapping } from "../events/mapping/StdIoEventMapping.js";
import { Helpers } from "../utils/Helpers.js";

export const RX_STD_IN_COMMAND = /^%([\w_-]+)%\s*/;

export type StdInRequest = {
	requestName: string,
	requestData: GenericJson,
}

export class InterfaceMessagingInterpreter {

	transformRequest(stdInString: string): StdInRequest|undefined {
		const command = stdInString.match(RX_STD_IN_COMMAND)?.[1];
		if (!command || !Object.keys(StdIoEventMapping.REQUESTS).includes(command)) {
			const err = new DuneError(ERROR.BAD_STD_IN_REQUEST, [ command ?? stdInString.slice(0,10) ]);
			console.warn(err.message);
			return;
		}
		else {
			const requestContents = stdInString.replace(RX_STD_IN_COMMAND, '');
			const data = Helpers.safeJsonify(requestContents) ?? {};
			logger.info(data, 'dfg');
			// TODO: handle expected arg keys if required
			return {
				requestName: command,
				requestData: data,
			};
		}
	}
}