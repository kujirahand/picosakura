import SequencerEvent, { EventType } from './SequencerEvent';
/** Event data for sequencer callback. Only available in the callback function due to the instance lifetime. */
export default interface ISequencerEventData {
    /** Returns the event type */
    getType(): EventType;
    /** Returns the source client id of event */
    getSource(): number;
    /** Returns the destination client id of event */
    getDest(): number;
    getChannel(): number;
    getKey(): number;
    getVelocity(): number;
    getControl(): number;
    getValue(): number;
    getProgram(): number;
    getData(): number;
    getDuration(): number;
    getBank(): number;
    getPitch(): number;
    getSFontId(): number;
}
/**
 * Rewrites event data with specified SequencerEvent object.
 * @param data destination instance
 * @param event source data
 * @return true if succeeded
 */
export declare function rewriteEventData(data: ISequencerEventData, event: SequencerEvent): boolean;
