<script lang="ts">
    import { onMount, beforeUpdate } from "svelte";
    import { GL } from "$lib/gl/index"
    import { slide } from "svelte/transition";
    import { quintInOut } from "svelte/easing"; 
    import Portrait from "$lib/assets/portrait.raw?raw-image";
    import { Utility } from "$lib/utilities/index";

    export let width = "100vw";
    export let height = "100vh";

    let canvas: HTMLCanvasElement;

    $: innerWidth = 0;
    $: innerHeight = 0;
    $: outerWidth = 0;
    $: outerHeight = 0;
    $: mousePositionX = 0;
    $: mousePositionY = 0;

    function handleMouse(event: MouseEvent): void {
        mousePositionX = event.x;
        mousePositionY = event.y;
    }

    onMount(() => {
        try {
            const gl = canvas.getContext("webgl2");
            if (gl === null) {
                console.error("WebGL context failed to be retrieved");
                // TODO: handle default rendering
                return;
            }

            const programs = [
                GL.ProgramProcedures.CellGridProgram,
            ];

            const programList = new GL.ProgramList(gl!, programs);
            const initErrors = programList.initPrograms()
                .unwrapOrElse((error) => {
                    console.error(error.error);
                    return null;
                });
            if (initErrors !== null) {
                for (const error of initErrors) {
                    console.error(error.error);
                }
            }

            let gridWidth = 1.0;
            let gridHeight = 1.0;
            let image = Utility.Images.nearestNeighborRGBA(Portrait, 1.0, 1.0)

            const proxy = <GL.ProgramProcedures.CellGridProgram>programList
                .getProgramProxy(GL.ProgramProcedures.CellGridProgram.getProgramID())
                .unwrap();

            const renderer = new GL.Renderer(gl);

            let dt = 0.0;
            let tick = 0.05;

            function render(): void {
                dt += tick;
                if (dt >= 2 * Math.PI) { dt -= 2 * Math.PI; }
                if (proxy.getGridWidth() !== gridWidth || proxy.getGridHeight() !== gridHeight)
                    updateGridImage();

                programList.setProgramRenderArguments([
                    [
                        -1, GL.ProgramProcedures.CellGridProgram.getProgramID(),
                        <GL.ProgramProcedures.CellGridProgramRenderArguments>{
                            uniforms: {
                                "uDeltaTime": [dt]
                            },
                            cellsSubGrid: {
                                parentRowStart: 0.0,
                                parentColumnStart: 0.5,
                                totalRows: gridWidth,
                                totalColumns: gridHeight,
                                totalComponents: 4,
                                data: image,
                            }
                        },
                    ]
                ]);

                renderer.setRendererArguments({
                    canvasDimensions: { w: innerWidth, h: innerHeight },
                    cursorPosition: {  x: mousePositionX / innerWidth * 2 - 1, y: mousePositionY / innerHeight * 2 - 1  },
                    deltaTime: dt
                });

                renderer.renderProgramList(programList);
                requestAnimationFrame(render);
            }

            function updateGridImage() {
                gridWidth = proxy.getGridWidth();
                gridHeight = proxy.getGridHeight();

                image = Utility.Images.nearestNeighborRGBA(Portrait, gridWidth / Portrait.length, gridHeight / Portrait[0].length)
                    .map((pixel: Array<Uint8Array>) => {
                        return pixel.map((rgba: Uint8Array) => { return ((rgba[0] + rgba[1] + rgba[2]) / 3.0) / 255.0 });
                    })
                    .flat(2);
            }

            requestAnimationFrame(render);
            console.log("[INFO] WebGL succesfully initialized");
        }

        catch (error: any) {
            console.error(error);
        }
    })
</script>

<svelte:window on:mousemove|preventDefault={handleMouse} bind:innerWidth bind:innerHeight bind:outerWidth bind:outerHeight />

<canvas bind:this={canvas}
        transition:slide={{ delay: 100, duration: 800, axis: "x", easing: quintInOut }}
        style="--width:{width}; --height:{height};"
        id="glCanvas"
        width={innerWidth}
        height={innerHeight}
/>

<style lang="postcss">
    #glCanvas {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 0;
        width: var(--width);
        height: var(--height);
    }
</style>
