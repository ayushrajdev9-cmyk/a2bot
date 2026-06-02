const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dance')
    .setDescription('Dance!'),
  async execute(interaction) {
    await interaction.deferReply();
    try {
      const res = await fetch('https://nekos.best/api/v2/dance').then(r => r.json());
      const embed = embeds.info(`💃 ${interaction.user.username} dances!`).setImage(res.results[0].url);
      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply({ embeds: [embeds.error('Error', 'Failed to fetch reaction.')] });
    }
  },
};
