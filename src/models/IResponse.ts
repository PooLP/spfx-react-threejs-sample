export interface IResponsePayload<T> {
    success: boolean;     
    statusText: string;
    data?: T;
}

export interface IResponse {
    success: boolean;     
    statusText: string;
}
