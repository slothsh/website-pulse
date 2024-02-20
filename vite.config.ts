import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { readFileSync } from "node:fs";
import { Buffer } from "node:buffer";

const binaryLoader = {
	name: "raw-bin",
	transform(code, id) {
		const [path, query] = id.split("?");
		if (query !== "raw-bin")
			return null;

		const data = readFileSync(path);

		let dataString = ""
		for (let b of data) {
			dataString += `${parseInt(b)}, `;
		}

		return `export default new Uint8Array([${dataString}]);`;
	}
}

export default defineConfig({
	plugins: [binaryLoader, sveltekit()]
});
