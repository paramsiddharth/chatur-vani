const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const { registerFont, createCanvas, loadImage } = require('canvas');

const { DIMENSION, FONT_RATIO } = require('./constants');

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

const getSVG = (text, width, height, fontName, fontSize, light) => {
	// HTML entitites
	const escapedText = text
		.replace(/\&/g, '&amp;').replace(/</g, '&lt;');

	const svg = `
	<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
		<foreignObject x="0" y="0" width="${width}" height="${height}">
			<style>
				

			div.a {
				margin: 20px 80px;
				height: ${height}px;
				font-weight: normal;
				${
					fontName != null
					? `font-family: ${JSON.stringify(fontName)};`
					: ''
				}
				font-style: italic;
				font-weight: bold;
				font-size: ${fontSize}px;
				color: ${light ? 'black' : 'white'};
				display: flex;
			}

			div.b {
				margin: auto;
			}
			</style>
			<div xmlns="http://www.w3.org/1999/xhtml">
				<div class='a'>
					<div class='b'>${escapedText}</div>
				</div>
			</div>
		</foreignObject>
	</svg>
	`
	.replace(/\n/g, '');

	return svg;
};

const render = async (text, postPath, light = false, colour = '#d00', font = null) => {
	await loadFonts();

	let defaultFont = process.env.DEFAULT_FONT || null;

	const height = DIMENSION,
	      width  = DIMENSION,
		  fontSize = DIMENSION * FONT_RATIO;
	const canvas = createCanvas(width, height);
	
	const svg = getSVG(text, width, height, defaultFont, fontSize, light);

	const ctx = canvas.getContext('2d');

	ctx.fillStyle = colour;
	ctx.fillRect(0, 0, width, height);

	const grad = ctx.createRadialGradient(
		width / 2, height / 2,
		width / 4,
		width / 2, height / 2,
		width * 4
	);

	grad.addColorStop(0, colour);
	grad.addColorStop(0.5, light ? 'white' : 'black');

	ctx.fillStyle = grad;
	ctx.fillRect(0, 0, width, height);

	// const img = await loadImage(`data:image/svg+xml,${svg}`);
	const img = await loadImage(path.resolve(__dirname, 'text.svg')); // :/ Oopsie...
	// console.log(`data:image/svg+xml,${svg}`);
	ctx.drawImage(img, 0, 0);

	const buf = canvas.toBuffer();
	fs.writeFileSync(path.join(postPath, 'post.png'), buf);
};

module.exports = {
	render
};