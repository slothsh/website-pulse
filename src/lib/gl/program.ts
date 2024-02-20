import type { Result } from "$lib/utilities/result";
import { OkResult, BadResult } from "$lib/utilities/result";
import type { Nullable } from "$lib/utilities/traits";
import type { Status as GLCommonStatus } from "$lib/gl/common";

export type Program = GL.Program;
export type ProgramConstructor = GL.ProgramConstructor;
export type ProgramSourceFiles = GL.ProgramSourceFiles;
export type ProgramRenderArguments = GL.ProgramRenderArguments;
export type RendererArguments = GL.RendererArguments;
export type Status = GLCommonStatus;
export type Attribute = GL.Attribute;
export type Uniform = GL.Uniform;
export type Buffer = GL.Buffer;
export type BufferMap = GL.BufferMap;
export type BufferShape = GL.BufferShape;
export type BufferMutator = GL.BufferMutator;
export type BufferMutatorArguments = GL.BufferMutatorArguments;
export type BufferDrawArguments = GL.BufferDrawArguments;
export type BufferDrawFunction = GL.BufferDrawFunction;
export type ProgramArguments = GL.ProgramArguments;
export type VertexAttributePointerArguments = GL.VertexAttributePointerArguments;
export type UniformPointerArguments = GL.UniformPointerArguments;
export type UniformArguments = GL.UniformArguments;

export function createProgram(programCtor: ProgramConstructor,
                              glContext: WebGL2RenderingContext,
                              programArguments?: ProgramArguments): Program
{
    return new programCtor(glContext, programArguments);
}

export class NullProgram implements Program {
    constructor(glContext: WebGL2RenderingContext, programArguments?: ProgramArguments) {}
    initProgram(): Result<Nullable<WebGLProgram>, Status> { return OkResult(null); }
    initBuffers(): Result<Nullable<Buffer[]>, Status> { return OkResult(null); }
    initAttributes(): Result<Nullable<Attribute[]>, Status> { return OkResult(null); }
    initUniforms(): Result<Nullable<Uniform[]>, Status> { return OkResult(null); }
    renderFrame(): Result<null, Status> { return OkResult(null); }
    getProgramID(): string { return this.id; }
    readonly id = NullProgram.name;
    readonly vertexShaderSource: string = "";
    readonly fragmentShaderSource: string = "";
    readonly programArguments: ProgramArguments = {
        attributes: [],
        uniforms: []
    };
}

export module GL {
    export interface ProgramSourceFiles {
        vertexShaderSource: string,
        fragmentShaderSource: string
    }

    // TODO: These don't need to return the actual Nullable program
    export interface InitializableProgram {
        initProgram(): Result<Nullable<WebGLProgram>, Status>,
        initBuffers(): Result<Nullable<Buffer[]>, Status>,
        initAttributes(): Result<Nullable<Attribute[]>, Status>,
        initUniforms(): Result<Nullable<Uniform[]>, Status>,
        readonly vertexShaderSource: string;
        readonly fragmentShaderSource: string;
        readonly programArguments: ProgramArguments;
    }

    export type BufferMutatorArguments = [number, BufferMutator][];
    export interface BufferDrawArguments {
        [key: number]: {
            drawArguments: any[],
            updateDefault?: boolean
        }
    }

    export interface RendererArguments {
        canvasDimensions: { w: number, h: number },
        cursorPosition: { x: number, y: number },
        deltaTime: number,
    }

    export interface ProgramRenderArguments {
        renderer?: RendererArguments,
        buffers?: BufferDrawArguments,
        uniforms?: UniformArguments,
        mutators?: BufferMutatorArguments
    }

    export interface RenderableProgram {
        renderFrame(_: ProgramRenderArguments): Result<null, Status>;
    }

    export interface Program
        extends
            InitializableProgram,
            RenderableProgram
    {
        getProgramID(): string;
    }

    export interface ProgramConstructor {
        new (glContext: WebGL2RenderingContext, programArguments?: ProgramArguments): Program;
    }

    export interface VertexAttributePointerArguments {
        readonly id: number,
        readonly name: string,
        readonly numComponents: number,
        readonly normalize: boolean,
        readonly stride: number,
        readonly offset: number,
        readonly bufferID: number,
        type?: number,
    }

    export interface UniformPointerFn {
        (_: WebGLProgram | null, ...args: any[]): void,
    }

    export interface UniformPointerArguments {
        readonly id: number,
        readonly name: string,
        setUniform?: UniformPointerFn,
    }

    export interface ProgramArguments {
        attributes: VertexAttributePointerArguments[],
        uniforms: UniformPointerArguments[]
    }

    export interface Attribute extends VertexAttributePointerArguments {
        readonly location: number,
    }

    export interface Uniform extends UniformPointerArguments {
        readonly location: WebGLUniformLocation,
    }

    export interface UniformArguments {
        [key: string]: any[]
    }

    export interface BufferShape {
        rows: number,
        columns: number,
        components: number,
    }

    export interface BufferDrawFunction {
        (...args: any[]): void
    }

    export interface Buffer {
        readonly id: number,
        readonly name: string,
        readonly buffer: WebGLBuffer,
        readonly type: number,
        data: Float32Array,
        shape: BufferShape,
        draw?: BufferDrawFunction,
        defaultArguments?: any[],
        // setDrawArgs: { (...args: any[]): void },
    }

    export interface BufferMap {
        [key: number]: Buffer,
    }

    export interface BufferMutator {
        // (buffer: Float32Array): Result<Nullable<Float32Array>, Status>
        (buffer: Float32Array): void
    }
}
