import ISynthesizer from './ISynthesizer';
import SequencerEvent from './SequencerEvent';
export interface ClientInfo {
    clientId: number;
    name: string;
}
/**
 * Abstract sequencer object, to process MIDI events with timestamp for scheduling.
 */
export default interface ISequencer {
    /**
     * Close the sequencer and release its resources.
     * After closed, all other methods cannot be used.
     */
    close(): void;
    /**
     * Register the destination synthesizer for events.
     * The sequencer object must be generated by the specified synthesizer object.
     * One synthesizer object can only be registered.
     * @param synth the synthesizer object or raw synthesizer instance value for the destination.
     * @return resolved with the registered client id
     */
    registerSynthesizer(synth: ISynthesizer | number): Promise<number>;
    /**
     * Unregister the client registered to this sequencer.
     * @param clientId registered client id (-1 for registered synthesizer)
     */
    unregisterClient(clientId: number): void;
    /**
     * Returns all registered clients.
     */
    getAllRegisteredClients(): Promise<ClientInfo[]>;
    /**
     * Returns all registered clients.
     */
    getClientCount(): Promise<number>;
    /**
     * Returns registered client by index.
     * @param index zero-based index number (max: <<resolved value of getClientCount()>> - 1)
     */
    getClientInfo(index: number): Promise<ClientInfo>;
    /**
     * Set the time scale for the events.
     * @param scale time scale value in ticks per second (default is 1000 for 1 tick per millisecond, max is 1000)
     */
    setTimeScale(scale: number): void;
    /**
     * Get the time scale for the events. The return value is ticks per second.
     * @return resolved with time scale value
     */
    getTimeScale(): Promise<number>;
    /**
     * Get the current tick value of the sequencer.
     * Note that the return value is differ from actual current value
     * if rendering synthesizer is active.
     * @return resolved with tick value
     */
    getTick(): Promise<number>;
    /**
     * Send event at the specified timing to all registered clients.
     * @param event event data
     * @param tick tick value to process event at (depend on the time scale)
     * @param isAbsolute true if tick is an absolute value, or
     *     false if tick is the relative value from the current time
     */
    sendEventAt(event: SequencerEvent, tick: number, isAbsolute: boolean): void;
    /**
     * Send event at the specified timing to the specific client.
     * @param clientId registered client id (-1 for registered synthesizer)
     * @param event event data
     * @param tick tick value to process event at (depend on the time scale)
     * @param isAbsolute true if tick is an absolute value, or
     *     false if tick is the relative value from the current time
     */
    sendEventToClientAt(clientId: number, event: SequencerEvent, tick: number, isAbsolute: boolean): void;
    /**
     * Remove all queued events for all registered clients.
     */
    removeAllEvents(): void;
    /**
     * Remove all queued events for specific client.
     * @param clientId registered client id (-1 for registered synthesizer)
     */
    removeAllEventsFromClient(clientId: number): void;
    /**
     * Process events queued in the sequencer.
     * If a synthesizer is registered, the processing is executed via synthesizer's render process automatically.
     * If not registered, you must use this method to process events.
     * @param msecToProcess time in milliseconds to advance sequencer process
     */
    processSequencer(msecToProcess: number): void;
}
