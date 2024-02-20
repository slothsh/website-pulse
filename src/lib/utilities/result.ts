import type { Unwrappable, Nullable, Callable } from "$lib/utilities/traits";
import type { ErrorWrapper } from "$lib/utilities/error";
import { WrapError } from "$lib/utilities/error";

export module Utility {
    export class Result<T, E extends number> implements Unwrappable<T> {
        constructor(value: Nullable<T>, error?: ErrorWrapper<E>) {
            this.value = value;
            this.error = error;
        }

        unwrap(): T {
            this.throwIfError();
            return this.value as T;
        }

        unwrapOr(alternative: T): T {
            if (this.checkIfError()) {
                return alternative;
            }
            return this.value as T;
        }

        unwrapOrElse(handler: Callable<ErrorWrapper<E>, T>): T {
            if (this.checkIfError()) {
                return handler(this.error!);
            }

            return this.value! as T;
        }

        private checkIfError(): boolean {
            if (this.value === null || this.error !== undefined) {
                return true;
            }

            return false
        }

        private throwIfError(): void {
            if (this.checkIfError()) {
                throw Error("unwrapped a result when value contained an error");
            }

            return;
        }

        private value: Nullable<T>;
        private error?: ErrorWrapper<E>;
    }

    export function OkResult<T>(value: T) {
        return new Result(value);
    }

    export function BadResult<E extends number>(status: E, message: string): Result<null, E> {
        return new Result(
            null,
            WrapError(
                status,
                Error(message)
            )
        );
    }
}

export import Result = Utility.Result;
export import OkResult = Utility.OkResult;
export import BadResult = Utility.BadResult;
