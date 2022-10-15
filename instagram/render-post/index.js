const fs = require('fs-extra');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const { render } = require('./render');
const { NAME } = require('./constants');

module.exports = { render };

const fail = msg => {
	console.error(msg);
	process.exit(1);
};

if (require && require.main === module)
	yargs(hideBin(process.argv))
		.check(argv => {
			if (!argv.help && !argv.version && !argv.text)
				throw new Error('No text provided.');
			else
				return true;
		})
		.scriptName(NAME)
		.usage('$0 <text> [colour] [light] [output-dir]')
		.command('$0 [text] [colour] [light] [output-dir]', 'Render the post (post.png)', {}, async argv => {
			// console.debug(argv);
			const { text } = argv;
			const colour = argv.colour ?? '#fff';
			const light = (argv.light ?? 'yes') === 'yes' ? true : false;
			const outputDir = argv.outputDir === ':-'
				? argv.outputDir
				: path.resolve(argv.outputDir ?? process.cwd());
			if (argv.outputDir !== ':-' && !fs.pathExistsSync(outputDir))
				fail(`Invalid path: ${outputDir}`);

			try {
				await render(text, outputDir, light, colour, 'Montserrat');
			} catch (e) {
				fail(e.message);
			}
		})
		.alias('v', 'version')
		.alias('?', 'help')
		.help('?')
		.argv;