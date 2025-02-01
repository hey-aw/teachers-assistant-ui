declare global {
    var ReadableStream: typeof import('stream/web').ReadableStream;
    var WritableStream: typeof import('stream/web').WritableStream;
    var TransformStream: typeof import('stream/web').TransformStream;
}

export { }; 