export module Utility {
    export function nearestNeighborRGBA(inputData: Array<Array<Uint8Array>>, sy: number, sx: number): Array<Array<Uint8Array>> {
        const outputData = Array<Array<Uint8Array>>(Math.floor(inputData.length * sy))
            .fill(Array(Math.floor(inputData[0].length * sx))
                .fill(new Uint8Array(4)
                      .fill(0)));

        for (let y = 0; y < inputData.length; ++y) {
            for (let x = 0; x < inputData[y].length; ++x) {
                const projectedY = Math.floor(y * sy);
                const projectedX = Math.floor(x * sx);
                outputData[projectedY][projectedX] = inputData[y][x];
            }
        }

        return outputData;
    }


    function bilinearLerp(originalImg: Array<Array<Uint8Array>>, newHScale: number, newWScale: number): Array<Array<Uint8Array>> {
        const oldW = originalImg.length;
        const oldH = originalImg[0].length;
        return [];
    }
}
