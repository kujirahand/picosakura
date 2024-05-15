declare type NullPointerType = number & {
    _null_pointer_marker: never;
};
export default PointerType;
declare type UniquePointerType<TMarker extends string> = NullPointerType | (number & {
    _pointer_marker: never;
} & {
    [P in TMarker]: never;
});
export { UniquePointerType };
export declare const INVALID_POINTER: NullPointerType;
