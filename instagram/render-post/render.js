const fs = require('fs-extra');
const path = require('path');

const { DIMENSION, FONT_RATIO } = require('./constants');

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
	const height = DIMENSION,
	      width  = DIMENSION,
		  fontSize = DIMENSION * FONT_RATIO;
	
	const svg = getSVG(text, width, height, defaultFont, fontSize, light);

	// TODO
};

module.exports = {
	render
};