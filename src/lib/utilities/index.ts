import type { Utility as _Result } from "$lib/utilities/result";
import type { Utility as _Traits } from "$lib/utilities/traits";
import { Utility as _Color } from "$lib/utilities/color";
import { Utility as _Obj } from "$lib/utilities/obj";

export module Utility {
    export import Color = _Color.Color;
    export import Obj = _Obj;
}

export type Result<T, E extends number> = _Result.Result<T, E>;
export type Error<T extends number> = _Result.Error<T>;
export type Nullable<T> = _Traits.Nullable<T>;
