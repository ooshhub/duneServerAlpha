export enum StdInCommands {
	
}

export interface StdInReaderInterface {

	writeToStdOut: (message: string) => Promise<void>;
	processStdInCommand: (handler: (command: StdInCommands, ...args: []) => void) => void;

}