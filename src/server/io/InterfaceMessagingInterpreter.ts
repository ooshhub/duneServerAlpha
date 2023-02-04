import { DuneError } from "../errors/DuneError.js";
import { ERROR } from "../errors/errors.js";
import { StdIoRequests } from "../events/mapping/StdIoEventMapping.js";
import { Helpers } from "../utils/Helpers.js";

export const RX_STD_IN_COMMAND = /^%([\w_-]+)%\s*/;

export type StdInRequest = {
	requestName: string,
	requestData: GenericJson,
}

export type StdOutResponse = {
	responseName: string,
	responseData: GenericJson,
}

export class InterfaceMessagingInterpreter {

	transformRequest(stdInString: string): StdInRequest {
		const command = stdInString.match(RX_STD_IN_COMMAND)?.[1];
		if (!command || !Object.keys(StdIoRequests).includes(command)) {
			const err = new DuneError(ERROR.BAD_STD_IN_REQUEST, [ command ?? stdInString.slice(0,10) ]);
			console.warn(err.message);
			return { requestName: '', requestData: {} };
		}
		else {
			const requestContents = stdInString.replace(RX_STD_IN_COMMAND, '');
			const data = Helpers.safeJsonify(requestContents) ?? {};
			// TODO: handle expected arg keys if required
			return {
				requestName: command,
				requestData: data,
			};
		}
	}

	transformResponse(stdOutResponse: StdOutResponse): string {
		const commandString = `%${stdOutResponse.responseName}%`,
			dataString = JSON.stringify(stdOutResponse.responseData);
		return `${commandString}${dataString}`;
	}
}