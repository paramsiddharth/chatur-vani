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
		.usage('$0 <text> [output-dir]')
		.command('$0 [text] [output-dir]', 'Render the post (post.png)', {}, async argv => {
			const { text } = argv;
			const outputDir = path.resolve(argv.outputDir ?? process.cwd());
			if (!fs.pathExistsSync(outputDir))
				fail(`Invalid path: ${outputDir}`);

			try {
				await render(text, outputDir);
			} catch (e) {
				fail(e.message);
			}
		})
		.alias('v', 'version')
		.alias('?', 'help')
		.help('?')
		.argv;