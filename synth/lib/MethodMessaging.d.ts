export interface MethodCallEventData {
    id: number;
    method: string;
    args: any[];
}
export interface MethodReturnEventData {
    id: number;
    method: string;
    val: any;
    error?: MessageErrorData;
}
export interface MessageErrorData {
    baseName: string;
    message: string;
    detail: any;
}
