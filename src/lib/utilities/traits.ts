export type Nullable<T> = Utility.Nullable<T>;
export type Callable<A, T> = Utility.Callable<A, T>;
export type Unwrappable<T> = Utility.Unwrappable<T>;
export module Utility {
    export type Nullable<T> = T | null;
    export interface Callable<A, T> {
        (..._: A[]): T
    }
    export interface Unwrappable<T> {
        unwrap(): T,
        unwrapOr(_: T): T,
        unwrapOrElse(_: Callable<any, T>): T
    }
}
