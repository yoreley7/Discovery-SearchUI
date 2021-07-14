import { InjectionToken } from '@angular/core';
// @ts-ignore
import streamSaver from 'streamsaver';

export type Saver = (blob: Blob, filename?: string) => void;

export const SAVER = new InjectionToken<Saver>('saver');

export function myStreamSaver (blob, filename) {

  // StreamSaver can detect and use the Ponyfill that is loaded from the cdn.
  // streamSaver.WritableStream = streamSaver.WritableStream;
  // streamSaver.TransformStream = streamSaver.TransformStream;

  console.log('Window:', window);

  const fileStream = streamSaver.createWriteStream( filename, {
    size: blob.size // Makes the percentage visible in the download
  });

  const readableStream = blob.stream();

  // more optimized pipe version
  // (Safari may have pipeTo but it's useless without the WritableStream)
  if (window.WritableStream && readableStream.pipeTo) {
    return readableStream.pipeTo(fileStream)
      .then(() => console.log('done writing'));
  }

  // less optimized
  const writer = fileStream.getWriter();

  const reader = readableStream.body.getReader();
  const pump = () => reader.read()
    .then(res => readableStream.done
      ? writer.close()
      : writer.write(res.value).then(pump));

  pump();
}
export function getSaver(): Saver {
  return myStreamSaver;
}

