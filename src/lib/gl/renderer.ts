import type { Program, ProgramRenderArguments, RendererArguments } from "$lib/gl/program";
import type { ProgramList } from "$lib/gl/programList";
import { Result, OkResult, BadResult } from "$lib/utilities/result";
import type { Nullable } from "$lib/utilities/traits";

export type Renderer = GL.Renderer;
export module GL {
    export class Renderer {
        constructor(glContext: WebGL2RenderingContext) {
            this.glContext = glContext;
            this.rendererArguments = {
                canvasDimensions: { w: 0, h: 0},
                cursorPosition: { x: 0, y: 0 },
                deltaTime: 0
            };
        }

        renderProgramList(programList: ProgramList): void {
            this.glContext.viewport(0.0, 0.0, this.rendererArguments.canvasDimensions.w, this.rendererArguments.canvasDimensions.h);
            for (const [_id, program, args] of programList) {
                // TODO: Warning if renderer arguments already exist in user arguments
                const argsWithRenderer: ProgramRenderArguments = {
                    renderer: {
                        ...this.rendererArguments
                    },
                    ...args
                };

                program.renderFrame(argsWithRenderer);
            }
        }

        setRendererArguments(args: RendererArguments) {
            this.rendererArguments = { ...args };
        }

        private glContext: WebGL2RenderingContext;
        private rendererArguments: RendererArguments;
    }
}
