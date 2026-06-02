const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cat')
    .setDescription('Get a random cat'),
  async execute(interaction) {
    await interaction.deferReply();
    try {
      const res = await fetch('https://some-random-api.ml/animal/cat').then(r => r.json());
      const embed = embeds.info('🐱 Random Cat').setImage(res.image);
      if (res.fact) embed.setDescription(res.fact);
      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply({ embeds: [embeds.error('Error', 'Failed to fetch.')] });
    }
  },
};
