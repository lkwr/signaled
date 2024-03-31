import { type observable } from 'solid-js';

export type Observable<T> = ReturnType<typeof observable<T>>;
