import { Result, OkResult, BadResult } from "$lib/utilities/result";
import type { ErrorWrapper } from "$lib/utilities/error";
import type { Program, ProgramSourceFiles, ProgramConstructor } from "$lib/gl/program";
import { createProgram, NullProgram, type ProgramRenderArguments } from "$lib/gl/program";
import type { Nullable } from "$lib/utilities/traits";
import { Status } from "$lib/gl/common";

export type ProgramList = GL.ProgramList;

export type ProgramItem = GL.ProgramItem;
export type ProgramRenderArgumentsItem = GL.ProgramRenderArgumentsItem;

export module GL {
    export type ProgramItem = [number, Program, ProgramRenderArguments];
    export type ProgramRenderArgumentsItem = [number, string, ProgramRenderArguments];

    export class ProgramList {
        constructor(glContext: WebGL2RenderingContext, programConstructors: Array<ProgramConstructor>) {
            this.glContext = glContext;
            this.programs = [];
            this.programConstructors = (programConstructors !== undefined) ? programConstructors! : [];
        }

        [Symbol.iterator]() {
            let index = -1;
            return {
                next: () => ({ value: this.programs[++index], done: !(index in this.programs) })
            }
        }

        initPrograms(programConstructors?: Array<ProgramConstructor>, programRenderArguments?: Array<ProgramRenderArgumentsItem>): Result<Nullable<ErrorWrapper<Status>[]>, Status> {
            let initErrors: ErrorWrapper<Status>[] = [];
            let programID = 0;
            this.programConstructors.push(...((programConstructors !== undefined) ? programConstructors! : []));

            // Initialize Shader Program
            for (let i = 0; i < this.programConstructors.length; ++i) {
                const newProgram = createProgram(
                    this.programConstructors[i],
                    this.glContext,
                );
                const shaderProgramResult = newProgram
                    .initProgram()
                    .unwrapOrElse((error: ErrorWrapper<Status>) => {
                        initErrors.push(error);
                        return null;
                    }) // TODO: then monadic function

                if (shaderProgramResult !== null) {
                    // Initialize Buffers
                    const initBuffersResult = newProgram!
                        .initBuffers()
                        .unwrapOrElse((error: ErrorWrapper<Status>) => {
                            initErrors.push(error);
                            return null;
                        });

                    // Initialize Attributes
                    const initAttributesResult = newProgram!
                        .initAttributes()
                        .unwrapOrElse((error: ErrorWrapper<Status>) => {
                            initErrors.push(error);
                            return null;
                        });

                    // Initialize Uniforms
                    const initUniformsResult = newProgram!
                        .initUniforms()
                        .unwrapOrElse((error: ErrorWrapper<Status>) => {
                            initErrors.push(error);
                            return null;
                        });

                    let argumentsIndex = null;
                    if (programRenderArguments !== undefined) {
                        for (let i = 0; i < programRenderArguments.length; ++i) {
                            // NOTE: This will duplicate arguments for duplicate programs in list
                            // TODO: Explore better solutions
                            const ignoreIndexID = programRenderArguments[i][0] === -1;
                            const matchingIndexID = programRenderArguments[i][0] === programID;
                            const matchingStringID = programRenderArguments[i][1] === newProgram!.getProgramID();
                            if ((ignoreIndexID || matchingIndexID) && matchingStringID) {
                                argumentsIndex = i;
                            }
                        }
                    }

                    if (argumentsIndex === null) {
                        console.log("[WARN]", `could not find a matching program to bind render arguments during ${ProgramList.name} program initialization`);
                    }

                    const renderArguments = (argumentsIndex !== null) ? programRenderArguments![argumentsIndex][2] : {};
                    this.programs.push([programID++, newProgram!, { ...renderArguments }]);
                }
            }

            return OkResult(initErrors);
        }

        setProgramRenderArguments(programRenderArguments: Array<ProgramRenderArgumentsItem>): void {
            let i = 0;
            for (let [id, program, _currentArguments] of this.programs) {
                for (const arg of programRenderArguments) {
                    // NOTE: This will duplicate arguments for duplicate programs in list
                    // TODO: Explore better solutions
                    const ignoreIndexID = arg[0] === -1;
                    const matchingIndexID = arg[0] === id;
                    const matchingStringID = arg[1] === program.getProgramID();
                    if ((ignoreIndexID || matchingIndexID) && matchingStringID) {
                        this.programs[i][2] = { ...arg[2] };
                    }
                }
                ++i;
            }
        }

        getProgramProxy(programID: string): Result<Nullable<Program>, Status> {
            for (const [id, p, args] of this.programs) {
                if (p.getProgramID() === programID) {
                    return OkResult(p);
                }
            }
            return BadResult(Status.PROGRAM_NOT_FOUND, `program not found in ${ProgramList.name} when searching for program proxy`);
        }

        get length() {
            return this.programs.length;
        }

        private glContext: WebGL2RenderingContext;
        private programs: Array<ProgramItem>;
        private programConstructors: Array<ProgramConstructor>;
    }
}
