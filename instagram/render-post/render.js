const fs = require('fs-extra');
const path = require('path');
const puppet = require('puppeteer');
const ejs = require('ejs');

const { DIMENSION, FONT_RATIO } = require('./constants');

const render = async (text, postPath, light = false, colour = '#d00' /* '#dff' */, font = 'Montserrat') => new Promise(async done => {
	const fontSize = DIMENSION * FONT_RATIO;

	const browser = await puppet.launch({
		headless: true,
		timeout: 5 * 60 * 1000
	});
	const page = await browser.newPage();

	const template = fs.readFileSync(path.resolve(__dirname, 'render.ejs')).toString();
	const html = ejs.compile(template)({
		dimension: DIMENSION,
		colour: colour,
		light,
		fontSize,
		text: text.replace(/\&/g, '&amp;').replace(/</g, '&lt;'),
		font
	});
	// fs.writeFileSync(path.join(__dirname, 'render.html'), html);
	/* await page.setViewport({
		width,
		height,
		deviceScaleFactor: 1,
	}); */
	await page.setContent(html, {
		waitUntil: 'networkidle0',
		timeout: 5 * 60 * 1000
	});

	const rendered = await page.$('#render');

	if (postPath === ':-')
		process.stdout.write('data:image/png;base64,' + (await rendered.screenshot({ encoding: 'base64' })));
	else
		await rendered.screenshot({ path: path.resolve(postPath, 'post.png') });
		// await page.screenshot({ path: path.join(__dirname, 'screenshot.png') });

	await browser.close();
});

module.exports = {
	render
};