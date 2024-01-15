<script lang="ts">
    export let fillColour: string;
    export let hoverColour: string;
    export let fillDuration: number = 250;
    export let fillDurationUnit: string = "ms";
    const fillDurationString = `${fillDuration}${fillDurationUnit}`
</script>

<svg style="--fill-colour:{fillColour}; --hover-colour:{hoverColour}; --fill-duration:{fillDurationString};" width="512" height="512" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M 211.5 10 L 394.5 10 Q 422.2 15.3 436 34.5 L 443 45.5 L 449 66.5 L 449 443.5 Q 444 472.5 424.5 487 Q 412.8 496.8 394.5 500 L 117.5 500 Q 89.8 494.7 76 475.5 L 67 459.5 L 63 443.5 L 63 155.5 L 67 140.5 L 71 132.5 Q 79.1 119.1 91.5 110 L 178.5 25 L 198.5 14 L 211.5 10 Z M 250 148 L 235 152 L 222 160 Q 213 167 207 178 L 203 188 L 201 198 Q 201 227 216 241 L 234 253 L 247 257 L 255 257 L 256 258 L 274 255 Q 285 251 294 243 Q 302 235 307 224 L 311 208 L 311 198 L 309 188 Q 306 176 299 169 Q 291 158 278 152 L 263 148 L 250 148 Z M 217 294 Q 201 300 189 310 Q 166 328 156 359 Q 154 371 160 377 L 165 381 L 175 386 L 184 388 L 192 388 L 193 389 L 332 389 L 340 387 L 347 383 Q 354 377 357 368 Q 358 357 355 352 Q 349 337 340 327 Q 323 306 298 294 L 292 294 L 282 298 L 272 300 L 264 300 L 263 301 L 241 300 L 226 296 L 223 294 L 217 294 Z "></path></svg>

<style lang="postcss" scoped>
    svg path {
        fill: var(--fill-colour);
        transition: fill var(--fill-duration) ease-in-out;
    }
    svg:hover path {
        fill: var(--hover-colour);
    }
</style>
