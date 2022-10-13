const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const { registerFont, createCanvas } = require('canvas');

const { DIMENSION } = require('./constants');

const loadFonts = async () => {
	if (!process.env.FONTS_LOADED) {
		const fontPath = path.resolve(__dirname, 'fonts');
		const fontFile = path.join(fontPath, 'items.json');

		if (fs.existsSync(fontFile)) {
			const fontData = fs.readJSONSync(fontFile);
			const { fonts } = fontData;
			if (fontData['default'] != null) {
				process.env.DEFAULT_FONT = fontData['default'];
			}

			// Load all fonts
			for (const font of fonts) {
				try {
					const { name } = font;

					// Fetch from Google fonts
					if (font.google) {
						const fontFiles = fs.readdirSync(fontPath).filter(p => p.startsWith(name));
						let fontFile = fontFiles.length > 0 ? path.join(fontPath, fontFiles[0]) : null;

						if (fontFile == null) {
							const resp = await axios.get(font.google);
							const contents = resp.data;
							const regexp = /src: url\((https:\/\/fonts\.gstatic\.com\/.+?\..+?)\)/g;
							const url = [...contents.matchAll(regexp)][0][1];
							const format = url.split('.').at(-1);
							fontFile = path.join(fontPath, name + '.' + format);

							// Download font
							const download = await axios.get(url, { responseType: 'arraybuffer' });
							await fs.writeFile(fontFile, Buffer.from(download.data), {
								encoding: 'binary'
							});
						}

						// Register font
						registerFont(fontFile, { family: name });
					} else if (font.file) {
						// Register font
						registerFont(path.join(fontPath, font.file), { family: name });
					} else {
						throw new Error('No font file/URL specified.');
					}
				} catch (e) {
					console.error(`Failed to register font: ${font.name ?? 'Unknown'}`);
					e.message && console.error(`\tError: ${e.message}`);
				}
			}
			process.env.FONTS_LOADED = 1;
		}
	}
};

loadFonts();

const render = async (text, path, font = null) => {
	await loadFonts();

	let defaultFont = process.env.DEFAULT_FONT || null;

	const height = DIMENSION,
	      width  = DIMENSION;
	const canvas = createCanvas(width, height);
};

module.exports = {
	render
};