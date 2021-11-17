const BaseCommand = require('../../utils/structures/BaseCommand');
const { inspect } = require('util');
const SourceBin = require('sourcebin');
const yargs = require('yargs');

module.exports = class EvalCommand extends BaseCommand {
    constructor() {
        super({
            name: 'eval',
            description: 'Execute a given piece of code.',
            category: 'owner',
            aliases: ['ev'],
            usage: 'eval [Code]',
            accessableby: 'Bot owner',
            examples: ['eval console.log(\'this is supposed to run\')'],
            ownerOnly: true
        });
    }

    async run(client, message, args) {
        const parsed = yargs(args).option('async', {
            alias: 'a',
            description: 'Whether it should be async.',
            type: 'boolean'
        }).option('mode', {
            alias: 'm',
            type: 'number',
            description: 'Depth.'
        }).parse();

        try {
            let toEval;
            let evaluated;
            const hrStart = process.hrtime();
            let mode = 0;

            if (parsed.async || parsed.a) {
                toEval = parsed._.join(' ');
                if (parsed.mode || parsed.m) mode = parsed.mode;
                evaluated = inspect((await eval(`(async () => {\n${toEval}\n})();`)), { depth: mode });
            } else {
                toEval = parsed._.join(' ');
                if (parsed.mode || parsed.m) mode = parsed.mode;
                evaluated = inspect(eval(toEval), { depth: mode });
            }

            const hrDiff = process.hrtime(hrStart);

            if (!toEval) return message.channel.send('Error while evaluating: `air`');

            if (evaluated && evaluated.toString().length <= 1024) {
                message.channel.send(`Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.\`\`\`ts\n${evaluated}\`\`\``);
            } else if (evaluated && evaluated.toString().length > 1024) {
                SourceBin.create([{
                    name: 'Eval output',
                    content: evaluated.toString(),
                    language: 'typescript',
                }]).then(obj => {
                    message.channel.send(`Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.\n${obj.short}`);
                });
            }
        } catch (e) {
            console.error(e);
            await message.channel.send(`Error while evaluating: \`${e.message}\``);
        }
    }
};