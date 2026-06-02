const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

const fonts = {
  block: str => str.split('').map(c => `[${c}]`).join(' '),
  bubble: str => str.split('').map(c => `:regional_indicator_${c.toLowerCase()}:`).join(' '),
  cursed: str => str.split('').map(c => `${c}̷`).join(''),
  smallcaps: str => str.replace(/[a-z]/g, c => String.fromCharCode(0x1D00 + c.charCodeAt(0) - 97)),
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ascii')
    .setDescription('Convert text to ASCII art')
    .addStringOption(o => o.setName('text').setDescription('Text to convert').setRequired(true))
    .addStringOption(o => o.setName('font').setDescription('Font style').addChoices(
      { name: 'Block', value: 'block' },
      { name: 'Bubble', value: 'bubble' },
      { name: 'Cursed', value: 'cursed' },
      { name: 'Small Caps', value: 'smallcaps' },
    )),
  async execute(interaction) {
    const text = interaction.options.getString('text');
    const font = interaction.options.getString('font') || 'block';
    const converted = fonts[font](text);
    await interaction.reply({ embeds: [embeds.info('ASCII Art', `\`\`\`\n${converted}\n\`\`\``)] });
  },
};
