import { StdInReaderInterface } from "./interfaces/StdInReaderInterface";

export class ServiceProviderRegistry {

	#stdInReader: StdInReaderInterface;
	#clientLinkProvider: ClientLinkInterface;
	#loggingService: LoggingInterface;

	constructor(
		stdInReader: StdInReaderInterface,
		clientLinkProvider: ClientLinkInterface,
		loggingService: LoggingInterface,
	)
	{
		this.#stdInReader = stdInReader;
		this.#clientLinkProvider = clientLinkProvider;
		this.#loggingService = loggingService;
		
	}
}