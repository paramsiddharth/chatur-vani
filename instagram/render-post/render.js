const fs = require('fs-extra');
const path = require('path');
const puppet = require('puppeteer');
const ejs = require('ejs');

const { DIMENSION, FONT_RATIO } = require('./constants');

const getSVG = (text, width, height, fontSize, light) => {
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
				font-family: 'Montserrat';
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

const render = async (text, postPath, light = false, colour = '#d00' /* '#dff' */, font = null) => new Promise(async done => {
	const height = DIMENSION,
	      width  = DIMENSION,
		  fontSize = DIMENSION * FONT_RATIO;
	
	const svg = getSVG(text, width, height, fontSize, light);

	const browser = await puppet.launch({
		headless: true
	});
	const page = await browser.newPage();

	const template = fs.readFileSync(path.resolve(__dirname, 'render.ejs')).toString();
	const html = ejs.compile(template)({
		dimension: DIMENSION,
		colour: JSON.stringify(colour),
		light,
		fontSize,
		text: JSON.stringify(text.replace(/\&/g, '&amp;').replace(/</g, '&lt;')),
		font: 'Montserrat'
	});
	fs.writeFileSync(path.join(__dirname, 'render.html'), html);
	await page.setContent(html, {
		waitUntil: 'networkidle0'
	});

	await new Promise(r => setTimeout(r, 4000));

	const dataURL = await page.evaluate(async () => {
		const e = document.querySelector('#canvas');
		return await e.toDataURL();
	});

	await page.setViewport({ width: 1440, height: 1080 });
	await page.screenshot({ path: path.join(__dirname, 'screenshot.jpeg') });

	await browser.close();

	const buf = Buffer.from(dataURL.replace(/^data:image\/png;base64,/, ''), 'base64');
	fs.writeFileSync(path.resolve(postPath, 'post.png'), buf, {
		encoding: 'binary'
	});
});

module.exports = {
	render
};