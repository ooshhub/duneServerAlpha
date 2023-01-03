export class InterfaceEvent {

  /**
   * @param {string} eventName
   * @param {object} eventData 
   */
  constructor({ eventName, eventData }) {
    eventData = eventData && typeof(eventData) === 'object'
      ? eventData
      : { data: eventData };
    eventName = eventName || 'unknown event';
    Object.assign(this, { eventName, eventData });
  }

}