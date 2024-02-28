import { Result, OkResult, BadResult } from "$lib/utilities/result";
import type { Nullable } from "$lib/utilities/traits";

export enum Status {
    FAIL_COMPILE_VERTEX_SHADER,
    FAIL_COMPILE_FRAGMENT_SHADER,
    FAIL_INIT_PROGRAM,
    FAIL_INIT_LINKING,
    FAIL_INIT_BUFFER,
    FAIL_INIT_ATTRIBUTE,
    FAIL_INIT_UNIFORM,
    FAIL_RENDER,
    PROGRAM_NOT_FOUND,
}

export module GL {
    export function initProgram(gl: WebGL2RenderingContext,
                                vsSource: string,
                                fsSource: string): Result<Nullable<WebGLProgram>, Status>
    {
        const vertexShader = Utils.loadShader(gl, vsSource, gl.VERTEX_SHADER);
        if (vertexShader === null) {
            return BadResult(
                Status.FAIL_COMPILE_VERTEX_SHADER,
                "could not load vertex shader during initialisation of shader program"
            );
        }

        const fragmentShader = Utils.loadShader(gl, fsSource, gl.FRAGMENT_SHADER);
        if (fragmentShader === null) {
            return BadResult(
                Status.FAIL_COMPILE_FRAGMENT_SHADER,
                "could not load fragment shader during initialisation of shader program"
            );
        }

        const shaderProgram = gl.createProgram();
        if (shaderProgram === null) {
            return BadResult(
                Status.FAIL_INIT_PROGRAM,
                "could not create shader program during initialisation of shader program"
            );
        }

        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            return BadResult(
                Status.FAIL_INIT_PROGRAM,
                "could not link shader program during initialisation of shader program"
            );
        }

        return OkResult(shaderProgram);
    }

    export function loadTextureFromURL(gl: WebGL2RenderingContext, url: string): WebGLBuffer {
        const textureBuffer = Utils.loadTexture(gl, url);
        if (textureBuffer === null) {
            throw new Error("could not create a WebGL buffer during load of texture from url");
        }

        return textureBuffer;
    }

    export namespace Utils {
        export function loadShader(gl: WebGL2RenderingContext,
                                   source: string,
                                   type: number): WebGLShader | null
        {
            const shader = gl.createShader(type);
            if (shader === null) {
                return null;
            }

            gl.shaderSource(shader, source);
            gl.compileShader(shader);

            const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
            if (!compiled) {
                const shaderLog = gl.getShaderInfoLog(shader);
                console.error(shaderLog);
                gl.deleteShader(shader);
                return null;
            }

            return shader;
        }

        export function loadTexture(gl: WebGL2RenderingContext, url: string): WebGLTexture | null {
            const texture = gl.createTexture();
            if (texture === null) {
                return null;
            }

            gl.bindTexture(gl.TEXTURE_2D, texture);

            const level = 0;
            const internalFormat = gl.RGBA;
            const width = 1;
            const height = 1;
            const border = 0;
            const srcFormat = gl.RGBA;
            const srcType = gl.UNSIGNED_BYTE;
            const pixel = new Uint8Array([0, 0, 255, 255]);
            gl.texImage2D(
                gl.TEXTURE_2D,
                level,
                internalFormat,
                width,
                height,
                border,
                srcFormat,
                srcType,
                pixel,
            );

            const image = new Image();
            image.onload = () => {
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(
                    gl.TEXTURE_2D,
                    level,
                    internalFormat,
                    srcFormat,
                    srcType,
                    image,
                );

                if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
                    gl.generateMipmap(gl.TEXTURE_2D);
                }

                else {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                }
            };

            image.src = url;

            return texture;
        }

        export function isPowerOf2(value: number): boolean {
            return (value & (value - 1)) === 0;
        }
    }

    export namespace Types {
        export type Vec2 = {
            x: number,
            y: number
        }

        export type Vec3 = {
            x: number,
            y: number,
            z: number
        }

        export type Vec4 = {
            x: number,
            y: number,
            z: number,
            w: number
        }

        export interface Program {
            info: ProgramInfo,
            buffers: Buffers,
        }

        export interface ProgramInfo {
            program: WebGLProgram,

            attributeLocations: {
                vertexPosition: number,
                vertexColor: number,
                vertexOffset: number,
                vertexNormal?: number,
                gridPosition?: number,
            },

            uniformLocations: {
                modelViewMatrix?: WebGLUniformLocation,
                projectionMatrix?: WebGLUniformLocation,
                normalMatrix?: WebGLUniformLocation,
                deltaTime?: WebGLUniformLocation,
                velocity?: WebGLUniformLocation,
                windowDimensions?: WebGLUniformLocation,
                cursorPosition?: WebGLUniformLocation,
                cursorOffset?: WebGLUniformLocation,
                mouseLMBPressed?: WebGLUniformLocation,
            }
        }

        export interface Buffers {
            position: WebGLBuffer,
            color: WebGLBuffer,
            offset: WebGLBuffer,
            grid?: WebGLBuffer,
            index?: WebGLBuffer,
            normal?: WebGLBuffer,
        }
    }
}
