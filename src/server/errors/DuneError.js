export class DuneError extends Error {
    loggable = true;
    fileName = '';
    lineNumber = 0;
    logToInterface = false;
    logToFile = false;
    constructor(errorMessage, replacers, options = {}) {
        const superOptions = options.cause ? { cause: options.cause } : undefined;
        if (replacers?.length) {
            for (let i = 0; i < replacers.length; i++)
                errorMessage = errorMessage.replace(`%${i}`, replacers[i]);
        }
        super(errorMessage, superOptions);
        if (options) {
            this.loggable = options.loggable ?? this.loggable;
            this.fileName = options.fileName ?? this.fileName;
            this.lineNumber = options.lineNumber ?? this.lineNumber;
            this.logToInterface = options.logToInterface ?? this.logToInterface;
            this.logToFile = options.logToFile ?? this.logToFile;
        }
    }
}
