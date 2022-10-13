const fs = require('fs-extra');
const path = require('path');
const puppet = require('puppeteer');
const ejs = require('ejs');

const { DIMENSION, FONT_RATIO } = require('./constants');

const render = async (text, postPath, light = false, colour = '#d00' /* '#dff' */, font = null) => new Promise(async done => {
	const height = DIMENSION,
	      width  = DIMENSION,
		  fontSize = DIMENSION * FONT_RATIO;

	const browser = await puppet.launch({
		headless: true
	});
	const page = await browser.newPage();

	const template = fs.readFileSync(path.resolve(__dirname, 'render.ejs')).toString();
	const html = ejs.compile(template)({
		dimension: DIMENSION,
		colour: colour,
		light,
		fontSize,
		text: text.replace(/\&/g, '&amp;').replace(/</g, '&lt;'),
		font: 'Montserrat'
	});
	// fs.writeFileSync(path.join(__dirname, 'render.html'), html);
	/* await page.setViewport({
		width,
		height,
		deviceScaleFactor: 1,
	}); */
	await page.setContent(html, {
		waitUntil: 'networkidle0'
	});

	const rendered = await page.$('#render');

	await rendered.screenshot({ path: path.resolve(postPath, 'post.png') });
	// await page.screenshot({ path: path.join(__dirname, 'screenshot.png') });

	await browser.close();
});

module.exports = {
	render
};