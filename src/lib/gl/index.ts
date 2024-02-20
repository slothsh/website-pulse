import { GL as _Common } from "$lib/gl/common";
import { GL as _Renderer } from "$lib/gl/renderer";
import type { GL as _Program } from "$lib/gl/program";
import { GL as _ProgramList } from "$lib/gl/programList";
import { GL as _CellGridProgram } from "$lib/gl/programCellGrid";

export module GL {
    export import Common = _Common;

    export type Program = _Program.Program;
    export type ProgramBuffer = _Program.Buffer;
    export type ProgramAttribute = _Program.Attribute;
    export type ProgramUniform = _Program.Uniform;
    export type ProgramSourceFiles = _Program.ProgramSourceFiles;
    export type ProgramArguments = _Program.ProgramArguments;

    export import Renderer = _Renderer.Renderer;
    export import ProgramList = _ProgramList.ProgramList;

    export module ProgramProcedures {
        export import CellGridProgram = _CellGridProgram.CellGridProgram;
    }
}

