<script lang="ts">
    import GithubIcon from "$lib/components/iconGithub.svelte";
    import LinkedinIcon from "$lib/components/iconLinkedin.svelte";
    import EmailIcon from "$lib/components/iconEmail.svelte";
    import InstagramIcon from "$lib/components/iconInstagram.svelte";
    import ResumeIcon from "$lib/components/iconResume.svelte";
    import WaveformIcon from "$lib/components/iconWaveform.svelte";
    import ComponentSpacer from "$lib/components/componentSpacer.svelte";
    import GLCanvas from "$lib/components/GLCanvas.svelte";
    import { onMount } from "svelte";

    const iconDefaultSize = 512;
    const iconPixelSize = 38;
    const iconScale = `${iconPixelSize / iconDefaultSize * 100}%`;
    const allIcons = [
        GithubIcon,
        LinkedinIcon,
        EmailIcon,
        InstagramIcon,
        ResumeIcon
    ];

    const transportMediaIcons = [
        WaveformIcon,
        WaveformIcon,
        WaveformIcon,
        WaveformIcon,
        WaveformIcon
    ];
</script>

<div id="backgroundMain" />
<GLCanvas />
<div id="backgroundFront" />

<section id="titleContainer">
    <ComponentSpacer direction="vertical" spacing={6} unit="rem">
        <ComponentSpacer direction="horizontal" spacing={4} unit="rem">
        {#each allIcons as icon, i}
            <a href="" style="--icon-scale: {iconScale}; --icon-pixel-size: {`${iconPixelSize}px`};" class="social-link">
                <svelte:component this={icon} fillDuration={300} fillColour="#CCCCCC" hoverColour="#EEEEEE" />
            </a>
        {/each}
        </ComponentSpacer>
        <ComponentSpacer direction="vertical" spacing={4} unit="rem">
            <ComponentSpacer direction="vertical" spacing={1} unit="rem">
                <h1 class="text-6xl uppercase font-bold tracking-widest">Stefan Olivier</h1>
                <h2 class="text-4xl text-dimmed uppercase font-medium tracking-widest">Developer</h2>
            </ComponentSpacer>
            <p class="text-2xl width-title text-dimmed uppercase font-medium tracking-wider">Lorem ipsum dolor sit amet consectetur. Nulla sagittis vestibulum dapibus scelerisque dui varius hendrerit dui vestibulum.</p>
        </ComponentSpacer>
    </ComponentSpacer>
</section>

<section id="browserContainer">
    <ComponentSpacer direction="vertical" spacing={4} unit="rem">
        <div id="browserScreen" class="border-white border-solid border-2 rounded-e"></div>
        <ComponentSpacer direction="horizontal" spacing={1} unit="rem">
            <p id="transportFile" class="text-xl font-medium lowercase absolute">lorem_ipsum.wav</p>
            <div class="w-px bg-white"></div>
            <ComponentSpacer direction="horizontal" spacing={2} unit="rem">
                <h1 class="text-xl font-medium uppercase">Home</h1>
                <ComponentSpacer direction="horizontal" spacing={2.5} unit="rem">
                {#each transportMediaIcons as icon, i}
                    <a href="" style="--icon-scale: {`${28 / iconDefaultSize * 100}%`}; --icon-pixel-size: {`${28}px`};" class="social-link">
                        <svelte:component this={icon} fillDuration={300} fillColour="#CCCCCC" hoverColour="#EEEEEE" />
                    </a>
                {/each}
                </ComponentSpacer>
            </ComponentSpacer>
        </ComponentSpacer>
    </ComponentSpacer>
</section>

<style lang="postcss" scoped>
    * {
        color: #EEEEEE;
    }

    .width-title {
        max-width: 50vw;
    }

    #backgroundMain {
        position: absolute;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle, #181818, #242424);
        background-size: 200% 200%;
        /* animation: gradientAnimation 5s infinite; */
    }

    #backgroundFront {
        position: absolute;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, #181818 30%, #18181800 100%);
        /* animation: gradientAnimation 5s infinite; */
    }

    .text-dimmed {
        color: #CCCCCC;
    }

    #titleContainer {
        position: absolute;
        top: 16vh;
        left: 8vw;
        z-index: 10;
    }

    #browserContainer {
        position: absolute;
        top: 16vh;
        right: 8vw;
        width: 35vw;
        height: 75vh;
        z-index: 0;
    }

    #browserScreen {
        width: 30vw;
        height: 30vw;
    }

    #transportFile {
        padding-right: 1rem;
        transform: translateX(-100%);
    }

    .social-link {
        height: 0px;
        width: 0px;
        transform: scale(var(--icon-scale));
    }

    @keyframes gradientAnimation {
        0% {
            background-position: 0% 0%;
        }

        100% {
            background-position: 100% 100%;
        }
    }
</style>
