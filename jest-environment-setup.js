const { ReadableStream, WritableStream, TransformStream } = require('stream/web');

Object.assign(global, {
  ReadableStream,
  WritableStream,
  TransformStream,
}); 