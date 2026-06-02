const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reverse')
    .setDescription('Reverse input text')
    .addStringOption(o => o.setName('text').setDescription('Text to reverse').setRequired(true)),
  async execute(interaction) {
    const text = interaction.options.getString('text');
    const reversed = text.split('').reverse().join('');
    await interaction.reply({ embeds: [embeds.info('🔄 Reversed Text', reversed)] });
  },
};
