import { GL as GLCommon } from "$lib/gl/common"
import { Status } from "$lib/gl/common";
import type {
    ProgramRenderArguments,
    Program,
    ProgramArguments,
    Buffer,
    BufferMap,
    BufferMutatorArguments,
    BufferDrawFunction,
    Attribute,
    Uniform,
    UniformArguments } from "$lib/gl/program";
import { Result, OkResult, BadResult } from "$lib/utilities/result";
import type { Nullable } from "$lib/utilities/traits";
import vertexShaderCells from "$lib/shaders/cells.vert.glsl?raw";
import fragmentShaderCells from "$lib/shaders/cells.frag.glsl?raw";

let c = 0;

export module GL {
    export enum BufferID {
        Cells,
    }

    export enum AttributeID {
        Position,
    }

    export enum UniformID {
        DeltaTime,
        WindowDimensions,
        CursorPostion,
    }

    export interface CellGridProgramRenderArguments
        extends ProgramRenderArguments
    {
        cellsSubGrid?: CellsSubGridData
    }

    export interface CellsGridData {
        w: number,
        h: number,
        density: number,
        radius: number,
        scale: number,
        subGrid: CellsSubGridData,
    }

    export interface CellsSubGridData {
        parentRowStart: number,
        parentColumnStart: number,
        totalRows: number,
        totalColumns: number,
        totalComponents: number,
        data: number[],
    }

    export class CellGridProgram implements Program {
        constructor(gl: WebGL2RenderingContext) {
            this.glContext = gl;
        }

        initProgram(): Result<Nullable<WebGLProgram>, Status> {
            const shaderProgram = GLCommon.initProgram(this.glContext, this.vertexShaderSource, this.fragmentShaderSource);
            const shaderProgramValue = shaderProgram.unwrapOr(null);
            if (shaderProgramValue !== null) {
                this.shaderProgram = shaderProgramValue!;
            }
            return shaderProgram;
        }

        initBuffers(): Result<Nullable<Buffer[]>, Status> {
            const bufferJobs = [
                {
                    init: this.initCellsPositionBuffer,
                    statusFail: Status.FAIL_INIT_BUFFER,
                    messageFail: `failed to initialize position buffer during ${this.constructor.name} buffer initialization`,
                    arguments: {
                        id: BufferID.Cells,
                        name: "cells",
                        draw: this.glContext.drawArrays,
                        defaultArguments: [this.glContext.ARRAY_BUFFER, 0, 0],
                        type: this.glContext.ARRAY_BUFFER,
                        data: new Float32Array,
                        shape: { rows: 0, columns: 0, components: 0 }
                    }
                },
            ];

            for (let job of bufferJobs) {
                try {
                    const result = job.init.bind(this)();
                    if (result === null) {
                        return BadResult(job.statusFail, job.messageFail);
                    } else {
                        this.buffers[job.arguments.id] = { buffer: result!, ...job.arguments };
                    }
                } catch (error) {
                    return BadResult(job.statusFail, job.messageFail);
                }
            }

            return OkResult([...Object.values(this.buffers)]);
        }

        initAttributes(): Result<Nullable<Attribute[]>, Status> {
            if (!this.checkIfShaderIsValid()) {
                return BadResult(
                    Status.FAIL_INIT_ATTRIBUTE,
                    `failed to initialize attributes during ${this.constructor.name} because shader program wasn't correctly properly initialized`
                );
            }

            // TODO: Is this necessary?
            if (!this.checkIfAttributeArgumentsAreValid())
                return OkResult([]);

            for (const attribute of this.programArguments.attributes) {
                switch (attribute.id) {
                    case AttributeID.Position: {
                        attribute.type = this.glContext.FLOAT
                    } break;
                    default: break;
                }
            }

            const attributeJobs = this.programArguments!
                .attributes!
                .map((attribute) => {
                    return {
                        init: this.glContext.getAttribLocation,
                        statusFail: Status.FAIL_INIT_ATTRIBUTE,
                        messageFail: `failed to retrieve attribute location for \"${attribute.name}\" during ${this.constructor.name} attribute initialization`,
                        arguments: {
                            ...attribute
                        }
                    };
                });

            for (let job of attributeJobs) {
                try {
                    const result = job.init.bind(this.glContext)(this.shaderProgram!, job.arguments.name);
                    if (result === -1) {
                        return BadResult(job.statusFail, job.messageFail);
                    } else {
                        this.attributes.push(
                            { location: result, ...job.arguments },
                        );
                    }
                } catch (error) {
                    return BadResult(job.statusFail, job.messageFail);
                }
            }

            return OkResult(this.attributes);
        }

        initUniforms(): Result<Nullable<Uniform[]>, Status> {
            if (!this.checkIfShaderIsValid()) {
                return BadResult(
                    Status.FAIL_INIT_UNIFORM,
                    `failed to initialize uniforms during ${this.constructor.name} because shader program wasn't correctly properly initialized`
                );
            }

            // TODO: Is this necessary?
            if (!this.checkIfUniformArgumentsAreValid())
                return OkResult([]);

            for (const uniform of this.programArguments.uniforms) {
                switch (uniform.id) {
                    case UniformID.DeltaTime: {
                        uniform.setUniform = this.glContext.uniform1f
                    } break;

                    case UniformID.WindowDimensions:
                    case UniformID.CursorPostion: {
                        uniform.setUniform = this.glContext.uniform2fv
                    } break;

                    default: break;
                }
            }

            const uniformJobs = this.programArguments!
                .uniforms!
                .map((uniform) => {
                    return {
                        init: this.glContext.getUniformLocation,
                        statusFail: Status.FAIL_INIT_UNIFORM,
                        messageFail: `failed to retrieve uniform location for \"${uniform.name}\" during ${this.constructor.name} uniform initialization`,
                        arguments: {
                            ...uniform
                        }
                    };
                });

            for (let job of uniformJobs) {
                try {
                    const result = job.init.bind(this.glContext)(this.shaderProgram!, job.arguments.name);
                    if (result === null) {
                        return BadResult(job.statusFail, job.messageFail);
                    } else {
                        this.uniforms.push(
                            { location: result!, ...job.arguments },
                        );
                    }
                } catch (error) {
                    return BadResult(job.statusFail, job.messageFail);
                }
            }

            return OkResult(this.uniforms);
        }

        renderFrame(renderArguments: CellGridProgramRenderArguments): Result<null, Status> {
            const gl = this.glContext;
            if (!this.checkIfShaderIsValid()) {
                return BadResult(
                    Status.FAIL_RENDER,
                    `failed to render frame due to invalid shader program in ${this.constructor.name}`
                );
            }

            gl.getExtension("OES_standard_derivatives")
            gl.getExtension("EXT_shader_texture_lod")
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.enable(gl.DEPTH_TEST);
            gl.clearDepth(1.0);
            gl.depthFunc(gl.LEQUAL);
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.BACK);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            this.setAttributes();
            this.setUniforms(renderArguments.uniforms);
            this.applyBufferMutators(renderArguments.mutators);
            this.bindBufferData();
            gl.useProgram(this.shaderProgram!);
            this.drawBuffers(renderArguments);

            return OkResult(null);
        }

        private initCellsPositionBuffer(): Nullable<WebGLBuffer> {
            const cellPositionBuffer = this.glContext.createBuffer();
            if (cellPositionBuffer === null)
                return null;

            this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, cellPositionBuffer);
            const positions: number[] = Array();
            this.glContext.bufferData(this.glContext.ARRAY_BUFFER, new Float32Array(positions), this.glContext.STATIC_DRAW);

            return cellPositionBuffer;
        }

        private setAttributes(): void {
            for (const attribute of this.attributes) {
                this.glContext.bindBuffer(this.buffers[attribute.bufferID].type, this.buffers[attribute.bufferID].buffer);
                this.glContext.vertexAttribPointer(
                    this.attributes[0].location,
                    attribute.numComponents,
                    attribute.type!,
                    attribute.normalize,
                    attribute.stride,
                    attribute.offset
                );
                this.glContext.enableVertexAttribArray(attribute.location);
            }
        }

        private setUniforms(args?: UniformArguments): void {
            if (args === undefined)
                return;

            for (const uniform of this.uniforms) {
                if (uniform.name in args!) {
                    uniform.setUniform!.bind(this.glContext)!(uniform.location, ...args[uniform.name]);
                }
            }
        }

        private applyBufferMutators(args?: BufferMutatorArguments): void {
            if (args === undefined)
                return;

            for (const [id, mutate] of args) {
                if (id in this.buffers) {
                    mutate(this.buffers[id].data);
                }
            }
        }

        private bindBufferData(): void {
            for (const k of Object.keys(this.buffers)) {
                const id = parseInt(k);
                this.glContext.bufferData(this.buffers[id].type, this.buffers[id].data, this.glContext.STATIC_DRAW)
            }
        }

        private drawBuffers(args?: CellGridProgramRenderArguments): void {
            if (args !== undefined) {
                this.setGridWidth(Math.ceil(args.renderer!.canvasDimensions.w / this.diameter) * this.density);
                this.setGridHeight(Math.ceil(args.renderer!.canvasDimensions.h / this.diameter) * this.density);

                for (const key of Object.keys(this.buffers)) {
                    const id = parseInt(key);
                    switch (id) {
                        case BufferID.Cells: {
                            const dependenciesStatisfied =
                                args !== undefined
                                && args.renderer !== undefined;
                                // && args.cellsSubGrid !== undefined;

                            if (dependenciesStatisfied) {
                                const gridData: CellsGridData = {
                                    w: this.gridWidth,
                                    h: this.gridHeight,
                                    density: this.density,
                                    radius: this.diameter / 2.0,
                                    scale: this.scale,
                                    subGrid: args!.cellsSubGrid!
                                };

                                // const drawArguments = this.mergeBufferDrawArguments(this.buffers[id].draw!, this.buffers[id].defaultArguments!, args!.buffers[id].drawArguments);
                                const points = this.updateGridBuffer(args, gridData);
                                this.buffers[id].draw!.bind(this.glContext)(this.glContext.POINTS, 0, points);
                            }
                        } break;
                        default: break;
                    }
                }
            }

            else {
                for (const key of Object.keys(this.buffers)) {
                    const id = parseInt(key);

                    this.buffers[id].draw!
                        .bind(this.glContext)
                        .bind(this.glContext)
                        (...this.buffers[id].defaultArguments!);
                }
            }
        }

        static getProgramID(): string {
            return CellGridProgram.name;
        }

        getProgramID(): string {
            return CellGridProgram.getProgramID();
        }

        private mergeBufferDrawArguments(drawFunction: BufferDrawFunction, defaultArguments: any[], userArguments: any[]): any[] {
            // TODO: Better way to verify that arguments are correct
            const mergedArguments: any[] = [];
            for (let i = 0; i < drawFunction.length; ++i) {
                if (i < userArguments.length) {
                    mergedArguments.push(userArguments[i]);
                } else {
                    mergedArguments.push(defaultArguments[i]);
                }
            }
            return mergedArguments;
        }

        private checkIfShaderIsValid(): boolean {
            if (this.shaderProgram === undefined) {
                return false;
            }
            return true
        }

        private throwIfShaderIsValid(): void {
            if (!this.checkIfShaderIsValid()) {
                throw Error("unwrapped a result when value contained an error");
            }

            return;
        }

        private checkIfAttributeArgumentsAreValid(): boolean {
            if (this.programArguments === undefined || this.programArguments!.attributes === undefined)
                return false;
            return true;
        }

        private checkIfUniformArgumentsAreValid(): boolean {
            if (this.programArguments === undefined || this.programArguments!.uniforms === undefined)
                return false;
            return true;
        }

        readonly vertexShaderSource: string = vertexShaderCells;
        readonly fragmentShaderSource: string = fragmentShaderCells;
        readonly programArguments: ProgramArguments = {
            attributes: [
                { id: AttributeID.Position, bufferID: BufferID.Cells, name: "aPosition", numComponents: 4, normalize: false, stride: 0, offset: 0, },
            ],

            uniforms: [
                { id: UniformID.DeltaTime, name: "uDeltaTime" },
                { id: UniformID.WindowDimensions, name: "uWindowDimensions" },
                { id: UniformID.CursorPostion, name: "uCursorPosition" },
            ]
        };

        private glContext: WebGL2RenderingContext;
        private shaderProgram?: WebGLProgram;
        private buffers: BufferMap = {};
        private attributes: Attribute[] = [];
        private uniforms: Uniform[] = [];

        private gridWidth: number = 1.0;
        private gridHeight: number = 1.0;
        private density: number = 3.0;
        private diameter: number = 150.0;
        private scale: number = 1.0;

        getGridWidth(): number { return this.gridWidth * 2.0; }
        getGridHeight(): number { return this.gridHeight * 2.0; }
        setGridWidth(w: number) { if (w >= 1.0) this.gridWidth = w; }
        setGridHeight(h: number) { if (h >= 1.0) this.gridHeight = h; }

        private updateGridBuffer(args: CellGridProgramRenderArguments, gridData: CellsGridData): number {
            const components = 4;
            const positions: number[] = Array((gridData.w * 2) * (gridData.h * 2) * components);

            let x = -1.0;
            let y = -1.0;
            const dx = 1 / gridData.w;
            const dy = 1 / gridData.h;
            const ax = (gridData.radius / args.renderer!.canvasDimensions.w);
            const ay = (gridData.radius / args.renderer!.canvasDimensions.h);
            const aspectRatio = args.renderer!.canvasDimensions.w / args.renderer!.canvasDimensions.h * (gridData.w / gridData.h);

            // Note: Multiply row and column boundaries by 2
            // to fill up all four quadrants of screen in WebGL canvas
            for (let i = 0; i < gridData.w * 2; ++i) {
                for (let j = 0; j < gridData.h * 2; ++j) {
                    const index = (i * gridData.h * 2 * components) + (j * components);

                    const distance = Math.sqrt((Math.pow(x - (args.renderer!.cursorPosition.x), 2) * aspectRatio) + Math.pow(y - (-args.renderer!.cursorPosition.y), 2));
                    positions[index + 3] = distance > 0.3 ? 0.1 : (1.0 - (2.0 * distance)) * 0.3;

                    // TODO: Proper relative bounds checking to prevent flowing off of grid
                    const r1 = Math.round(gridData.subGrid.parentColumnStart * gridData.w * 2);
                    const r2 = r1 + Math.round(gridData.subGrid.totalColumns);
                    const c1 = Math.round(gridData.subGrid.parentRowStart * gridData.h * 2);
                    const c2 = c1 + Math.round(gridData.subGrid.totalRows);

                    if (r1 <= i && i < r2 && c1 <= j && j < c2) {
                        const localIndex = (i * gridData.h * 2) + (j);
                        positions[index + 0] = x + (ax / gridData.density);
                        positions[index + 1] = y + (ay / gridData.density);
                        positions[index + 2] = gridData.radius * 1.0;
                        // positions[index + 2] = gridData.radius * (gridData.subGrid.data[localIndex]); // TODO: Map of each component
                    } else {
                        positions[index + 0] = x + (ax / gridData.density);
                        positions[index + 1] = y + (ay / gridData.density);
                        positions[index + 2] = gridData.radius;
                    }

                    y += dy; 
                }

                x += dx;
                y = -1;
            }

            this.glContext.bufferData(this.glContext.ARRAY_BUFFER, new Float32Array(positions), this.glContext.STATIC_DRAW);

            return positions.length / 4;
        }
    }
}
