<script lang="ts">
    export let width: string;
    export let height: string;
    export let hue: number = 0;
    const hueRotation = `${hue}deg`;
</script>

<div id="waveformBlockRoot"
     style="--hue:{hueRotation}; --width:{width}; --height:{height};"
/>

<style lang="postcss" scoped>
    #waveformBlockRoot {
        width: var(--width);
        height: var(--height);
        background: linear-gradient(90deg, #303030 0%, #454545 50%, #181818);
        filter: sepia() hue-rotate(var(--hue)) saturate(150%);
    }
</style>
