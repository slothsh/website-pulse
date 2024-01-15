<script lang="ts">
    import WavefromBlock from "$lib/components/waveformBlock.svelte";
    export let blocks: number = 16;

    const blockHeight = `${100 / blocks}%`;
    const randomDimension = () => {
        const randomNumber = Math.random();
        
        return `${((randomNumber < 0.33) ? randomNumber * 2 : randomNumber) * 100}%`;
    };
</script>

<div id="waveformGridRoot" class="flex flex-col justify-evenly">
    {#each Array(blocks) as _, i}
        <WavefromBlock width={randomDimension()} height={blockHeight} hue={170}/>
    {/each}
</div>

<style lang="postcss" scoped>
    #waveformGridRoot {
        position: absolute;
        top: 0px;
        left: 0px;
        width: 50vw;
        height: 100vh;
    }
</style>
