const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('compliment')
    .setDescription('Give a random compliment')
    .addUserOption(o => o.setName('user').setDescription('User to compliment').setRequired(false)),
  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    await interaction.deferReply();
    try {
      const res = await fetch('https://complimentr.com/api');
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      await interaction.editReply({
        embeds: [embeds.success('💖 Compliment', `${target}, ${data.compliment}`)],
      });
    } catch {
      await interaction.editReply({ embeds: [embeds.error('Error', 'Failed to fetch a compliment. Try again later.')] });
    }
  },
};
