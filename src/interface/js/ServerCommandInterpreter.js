import { InterfaceEvent } from "./InterfaceEvent.js";
import { StdIoEventMapping } from "../../server/events/mapping/StdIoEventMapping";

export class ServerCommandInterpreter {

  rxMarker = /^%(\w+)-?(\w+)?%\s*/;
  #serverMessageStyle ='background: purple; color: white; padding:1px 5px 1px 5px; border-radius: 3px; ';
  #serverRequestKeys = [ ...Object.keys(StdIoEventMapping.REQUESTS) ];
  #serverKeyMap = {
    ...StdIoEventMapping.REQUESTS,
    ...StdIoEventMapping.UPDATES,
    ...StdIoEventMapping.LOGGING,
  }

  #jsonify(inputString) {
    if (typeof(inputString) !== 'string') return undefined;
    let output = undefined;
    try { output = JSON.parse(inputString); }
    catch(e) { /* */ }
    return output;
  }

  // %CONSOLE-LOG%stuff
  // Log a Server console event to local dev tools
  #consoleLogger(logType, stdOutMessage) {
    const rxLogType = /^%CONSOLE-(\w+)%\s*/,
      logString = stdOutMessage.replace(rxLogType, ''),
      logContents = this.#jsonify(logString) ?? logString,
      logArray = Array.isArray(logContents) ? logContents : [ logContents ],
      consoleTarget = console[logType] ?? console.log;
    consoleTarget(`%cServer:`, this.#serverMessageStyle, ...logArray);
  }

  // Inspect a server message and send back an Event
  // Console logging events go straight to consoleLogger
  transformStdOut(stdOutMessage) {
    const [ , serverMessageKey, logLevel ] = (stdOutMessage.match(this.rxMarker) ?? []),
      serverMessageContents = stdOutMessage.replace(this.rxMarker, '');
    if (serverMessageKey && serverMessageKey in this.#serverKeyMap) {
      if (serverMessageKey === StdIoEventMapping.LOGGING.CONSOLE) this.#consoleLogger(logLevel.toLowerCase(), stdOutMessage);
      else {
        return new InterfaceEvent({
          eventName: this.#serverKeyMap[serverMessageKey],
          eventData: this.#jsonify(serverMessageContents) ?? { data: serverMessageContents }
        });
      }
    }
    else console.warn(`Interpreter could not understand message:\n${stdOutMessage}`);
  }

  transformStdErr(stdErrMessage) {
    const [ , serverMessageMarker, logLevel ] = (stdErrMessage.match(this.rxMarker) ?? []);
    // Handle a warning or error generated intentionally for logging
    if (serverMessageMarker === 'CONSOLE') {
      const messageContents = stdErrMessage.replace(this.rxMarker, '');
      this.#consoleLogger(logLevel, messageContents);
    }
    // Handle a thrown error
    else {
      const newError = this.#jsonify(stdErrMessage) ?? new Error(stdErrMessage);
      return new InterfaceEvent({
        eventName: StdIoEventMapping.UPDATES.UPDATE_ERROR,
        eventData: newError
      });
    }
  }

  /**
   * Stringify a server request
   * @param {string} commandString 
   * @param {object} requestData 
   * @returns {void}
   */
  buildServerCommand(commandString  = '', requestData = {}) {
    commandString = commandString.toUpperCase();
    if (this.#serverRequestKeys.includes(commandString)) {
      const requestDataString = JSON.stringify(requestData) ?? '';
      return `%${commandString}%${requestDataString}`;
    }
    else console.warn(`Bad server command: "${commandString}"`);
  }

}