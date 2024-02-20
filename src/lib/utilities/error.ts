export module Utility {
    export class ErrorWrapper<T extends number> {
        constructor(type: T, error: Error) {
            this.type = type;
            this.error = error;
        }

        type: T;
        error: Error;
    }

    export function WrapError<T extends number>(type: T, error: Error): ErrorWrapper<T> {
        return new ErrorWrapper(type, error);
    }
}

export import ErrorWrapper = Utility.ErrorWrapper;
export import WrapError = Utility.WrapError;
