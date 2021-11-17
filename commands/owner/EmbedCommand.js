const BaseCommand = require('../../utils/structures/BaseCommand');
const { MessageEmbed } = require('discord.js');
const yargs = require('yargs');

module.exports = class EmbedCommand extends BaseCommand {
    constructor() {
        super({
            name: 'embed',
            description: 'Generates an embed\nFlags:\n-t | Title\n-d | Description\n-c | Color\n-f | Footer\n-i | Image\n--th | Thumbnail.',
            category: 'owner',
            aliases: ['em'],
            usage: 'embed [Flag] [Value]',
            accessableby: 'Bot owner',
            examples: ['embed -t Cool embed', 'embed -d cool description -c #FF0000', 'embed -f cool footer'],
            ownerOnly: true
        });
    }

    async run(client, message, args) {

        const parsed = yargs(args).option('title', {
            alias: 't',
            type: 'array'
          }).option('description', {
            alias: 'd',
            type: 'array'
          }).option('color', {
            alias: 'c',
            type: 'array'
          }).option('footer', {
            alias: 'f',
            type: 'array'
          }).option('image', {
            alias: 'i',
            type: 'string'
          }).option('thumbnail', {
            alias: 'th',
            type: 'string'
          }).parse();

          if(parsed._.length >= 1) return message.channel.send(`You must provide at least one option. \`${this.usage}\``);

          const embed = new MessageEmbed()
          .setTimestamp();

          if(parsed.t || parsed.title) {
            embed.setTitle(parsed.title.join(' '));
          }

          if(parsed.d || parsed.description) {
            embed.setDescription(parsed.description.join(' '));
          }

          if(parsed.c || parsed.color) {
            embed.setColor(parsed.color[0]);
          }

          if(parsed.f || parsed.footer) {
            embed.setFooter(parsed.footer.join(' '), message.guild.iconURL({ dynamic: true }));
          }

          if(parsed.i || parsed.image) {
            embed.setImage(parsed.image[0]);
          }

          if(parsed.th || parsed.thumbnail) {
            embed.setThumbnail(parsed.thumbnail);
          }

          message.channel.send(embed);

    }
};