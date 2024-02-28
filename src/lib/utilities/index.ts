import type { Utility as _Error } from "$lib/utilities/error";
import type { Utility as _Result } from "$lib/utilities/result";
import type { Utility as _Traits } from "$lib/utilities/traits";
import { Utility as _Images } from "$lib/utilities/images";

export module Utility {
    export import Images = _Images;
}

export type Result<T, E extends number> = _Result.Result<T, E>;
export type Error<T extends number> = _Error.ErrorWrapper<T>;
export type Nullable<T> = _Traits.Nullable<T>;
