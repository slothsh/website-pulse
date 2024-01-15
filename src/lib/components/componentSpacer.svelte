<script lang="ts">
    export let direction: string;
    export let spacing: number;
    export let unit: string;

    const isDirectionHorizontal = direction == "horizontal";
    const directionStyle = isDirectionHorizontal
        ? "flex-row"
        : "flex-col";

    const classes = [
        "flex",
        directionStyle,
    ].join(" ");
</script>

<div id="spacer-root" style="--spacing:{spacing}{unit}" class={classes}>
    <slot />
</div>

<style lang="postcss" scoped>
    #spacer-root {
        gap: var(--spacing);
    }
</style>
