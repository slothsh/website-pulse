import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { readFileSync } from "node:fs";
import { Buffer } from "node:buffer";

const rawImageLoader = {
	name: "raw-bin",
	transform(code, id) {
		const [path, query] = id.split("?");
		if (query !== "raw-image")
			return null;

		const data = readFileSync(path);
		let resolutionSliceEnd = 0;
		for (let i = 0; i < 10; ++i) {
			if (data[i] === 0x0a) {
				resolutionSliceEnd = i;
				break;
			}
		}

		if (resolutionSliceEnd === 0)
			return null;

		const resolutionParts = data
			.slice(0, resolutionSliceEnd)
			.toString()
			.split("x")
			.map((value: string): number => {
				try {
					const n = parseInt(value.trim());
					return n;
				} catch (error) {
					return 0;
				}
			});

		if (resolutionParts.length !== 3
			&& (resolutionParts[0] === 0 || resolutionParts[1] === 0 || resolutionParts[2] === 0))
		{
			return null;
		}

		let arrayConstructorString = "";
		for (let y = 0; y < resolutionParts[0]; ++y) {
			arrayConstructorString += "Array("
			for (let x = 0; x < resolutionParts[1]; ++x) {
				const dataIndex = (y * resolutionParts[0] * resolutionParts[2]) + (x * resolutionParts[2]) + (resolutionSliceEnd + 1);
				arrayConstructorString += "new Uint8Array(["
					arrayConstructorString += `${parseInt(data[dataIndex + 0])},`; // r
					arrayConstructorString += `${parseInt(data[dataIndex + 1])},`; // g
					arrayConstructorString += `${parseInt(data[dataIndex + 2])},`; // b
					arrayConstructorString += `${parseInt(data[dataIndex + 3])},`; // a
				arrayConstructorString += "]),";
			}
			arrayConstructorString += "),";
		}

		return `export default Array(${arrayConstructorString})`;

		// let arrayConstructorString = "";
		// for (let y = 0; y < resolutionParts[0]; ++y) {
		// 	for (let x = 0; x < resolutionParts[1]; ++x) {
		// 		const dataIndex = (resolutionParts[0] * y) + x + (resolutionSliceEnd + 1);
		// 		arrayConstructorString += `${parseInt(data[dataIndex])},`;
		// 	}
		// }
		// 
		// return `export default new Uint8Array([${arrayConstructorString}])`;
	}
}

export default defineConfig({
	plugins: [rawImageLoader, sveltekit()]
});
