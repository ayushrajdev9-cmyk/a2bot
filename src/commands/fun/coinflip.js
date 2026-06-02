const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flip a coin'),
  async execute(interaction) {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    const emoji = result === 'Heads' ? '🪙' : '🪙';
    const msg = result === 'Heads' ? 'It landed heads up!' : 'Tails! Close one.';
    await interaction.reply({ embeds: [embeds.info(`${emoji} Coin Flip`, `**${result}**\n${msg}`)] });
  },
};
