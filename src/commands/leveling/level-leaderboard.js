const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const db = require('../../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('level-leaderboard')
    .setDescription('Show the top users by level'),
  async execute(interaction) {
    const allData = db.all('levels');
    if (!allData || Object.keys(allData).length === 0) {
      return interaction.reply({ embeds: [embeds.info('No leveling data yet.')] });
    }

    const entries = Object.entries(allData);
    const sorted = entries
      .map(([id, data]) => ({
        id,
        xp: data.xp || 0,
        level: Math.floor(0.1 * Math.sqrt(data.xp || 0)),
      }))
      .sort((a, b) => b.level - a.level || b.xp - a.xp)
      .slice(0, 10);

    const medals = ['🥇', '🥈', '🥉'];
    const embed = embeds.info()
      .setTitle('🏆 Level Leaderboard')
      .setDescription('Top 10 users by level');

    for (let i = 0; i < sorted.length; i++) {
      const { id, level, xp } = sorted[i];
      const user = await interaction.client.users.fetch(id).catch(() => null);
      const name = user ? user.username : 'Unknown User';
      const prefix = medals[i] || `#${i + 1}`;
      embed.addFields({ name: `${prefix} ${name}`, value: `Level ${level} (${xp} XP)`, inline: false });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
