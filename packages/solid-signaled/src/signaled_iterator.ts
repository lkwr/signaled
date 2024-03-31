import { type Accessor, createSignal } from 'solid-js';
import { Signaled } from './signaled';

export class SignaledIterator<T> extends Signaled<T, Accessor<T>, undefined> {
  readonly unsubscribe: () => void;
  readonly done: Promise<void>;

  constructor(iterator: AsyncIterator<T>, initialValue: T) {
    let unsubscribe: () => void = () => {};

    const unsubscribePromise = new Promise<IteratorResult<T, undefined>>(
      (resolve) => (unsubscribe = () => resolve({ done: true, value: undefined }))
    );

    const [accessor, setter] = createSignal<T>(initialValue, { equals: false });

    const done = new Promise<void>(async (resolve) => {
      while (true) {
        const { done, value } = await Promise.race([iterator.next(), unsubscribePromise]);
        if (done) break;
        setter(() => value);
      }
      resolve();
    });

    super(accessor, undefined);

    this.done = done;
    this.unsubscribe = unsubscribe;
  }

  static fromIterator<T>(iterator: AsyncIterator<T>, initialValue: T): SignaledIterator<T> {
    return new SignaledIterator(iterator, initialValue);
  }

  static fromIterable<T>(iterable: AsyncIterable<T>, initialValue: T): SignaledIterator<T> {
    const iterator = iterable[Symbol.asyncIterator]();
    return new SignaledIterator(iterator, initialValue);
  }
}

export const createIterator = <T>(
  iterator: AsyncIterator<T>,
  initialValue: T
): SignaledIterator<T> => SignaledIterator.fromIterator(iterator, initialValue);

export const createIterable = <T>(
  iterable: AsyncIterable<T>,
  initialValue: T
): SignaledIterator<T> => SignaledIterator.fromIterable(iterable, initialValue);
