const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dog')
    .setDescription('Get a random dog'),
  async execute(interaction) {
    await interaction.deferReply();
    try {
      const res = await fetch('https://some-random-api.ml/animal/dog').then(r => r.json());
      const embed = embeds.info('🐶 Random Dog').setImage(res.image);
      if (res.fact) embed.setDescription(res.fact);
      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply({ embeds: [embeds.error('Error', 'Failed to fetch.')] });
    }
  },
};
