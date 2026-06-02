const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('choose')
    .setDescription('Let the bot choose between options')
    .addStringOption(o => o.setName('options').setDescription('Comma-separated options to choose from').setRequired(true)),
  async execute(interaction) {
    const options = interaction.options.getString('options').split(',').map(s => s.trim()).filter(Boolean);
    if (options.length < 2) {
      return interaction.reply({ embeds: [embeds.error('Please provide at least 2 options separated by commas.')] });
    }
    const choice = options[Math.floor(Math.random() * options.length)];
    await interaction.reply({ embeds: [embeds.success(`I choose: **${choice}**`)] });
  },
};
