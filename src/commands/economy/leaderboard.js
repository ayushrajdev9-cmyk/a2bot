const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const db = require('../../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show the richest users'),
  async execute(interaction) {
    const allData = db.all('economy');
    if (!allData || Object.keys(allData).length === 0) {
      return interaction.reply({ embeds: [embeds.info('No economy data yet.')] });
    }

    const entries = Object.entries(allData);
    const sorted = entries
      .map(([id, data]) => ({
        id,
        total: (data.balance || 0) + (data.bank || 0),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    const medals = ['🥇', '🥈', '🥉'];
    const embed = embeds.info()
      .setTitle('🏆 Economy Leaderboard')
      .setDescription('Top 10 richest users');

    for (let i = 0; i < sorted.length; i++) {
      const { id, total } = sorted[i];
      const user = await interaction.client.users.fetch(id).catch(() => null);
      const name = user ? user.username : 'Unknown User';
      const prefix = medals[i] || `#${i + 1}`;
      embed.addFields({ name: `${prefix} ${name}`, value: `${total} coins`, inline: false });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
