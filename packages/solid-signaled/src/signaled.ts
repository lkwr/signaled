import { type Setter, type Accessor, untrack, observable, type Signal } from 'solid-js';
import type { Observable } from './types';

export class Signaled<T, TAccessor extends Accessor<T>, TSetter extends Setter<T> | undefined> {
  private readonly accessor: TAccessor;
  private readonly setter: TSetter;

  private observable: Observable<T> | undefined;

  constructor(accessor: TAccessor, setter: TSetter = undefined as TSetter) {
    this.accessor = accessor;
    this.setter = setter;
  }

  get value(): T {
    return this.accessor();
  }

  set value(value: TSetter extends Setter<T> ? T : never) {
    this.setter?.(() => value);
  }

  get untracked(): T {
    return untrack(this.accessor);
  }

  subscribe(callback: (value: T) => void): () => void {
    if (!this.observable) this.observable = observable(this.accessor);
    return this.observable.subscribe(callback).unsubscribe;
  }

  static fromSignal<T, TSignal extends Signal<T>>(
    signal: TSignal
  ): Signaled<T, TSignal[0], TSignal[1]> {
    return new Signaled(signal[0], signal[1]);
  }
}

export const signaled = <T>(signal: Signal<T>): Signaled<T, Accessor<T>, Setter<T>> =>
  Signaled.fromSignal(signal);
