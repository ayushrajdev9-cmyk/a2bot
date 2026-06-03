const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fact')
    .setDescription('Get a random fact'),
  async execute(interaction) {
    await interaction.deferReply();
    try {
      const res = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en');
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      await interaction.editReply({
        embeds: [embeds.info('📖 Random Fact', data.text)],
      });
    } catch {
      await interaction.editReply({ embeds: [embeds.error('Error', 'Failed to fetch a fact. Try again later.')] });
    }
  },
};
