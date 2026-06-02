const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Roll a die')
    .addIntegerOption(o => o.setName('sides').setDescription('Number of sides (2-100)').setMinValue(2).setMaxValue(100)),
  async execute(interaction) {
    const sides = interaction.options.getInteger('sides') || 6;
    const roll = Math.floor(Math.random() * sides) + 1;
    await interaction.reply({
      embeds: [embeds.info('🎲 Dice Roll', `You rolled a **${roll}** (d${sides})`)],
    });
  },
};
