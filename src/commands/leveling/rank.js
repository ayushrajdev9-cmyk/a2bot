const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const db = require('../../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Check your or another user\'s level rank')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to check')
        .setRequired(false)),
  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const levelData = db.get('levels', target.id) || { xp: 0 };

    const xp = levelData.xp || 0;
    const level = Math.floor(0.1 * Math.sqrt(xp));
    const xpForCurrentLevel = Math.pow(level / 0.1, 2);
    const xpForNextLevel = Math.pow((level + 1) / 0.1, 2);
    const progress = xpForNextLevel > xpForCurrentLevel
      ? Math.min(100, Math.floor(((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100))
      : 100;

    const embed = embeds.info()
      .setTitle(`${target.username}'s Rank`)
      .addFields(
        { name: 'Level', value: `${level}`, inline: true },
        { name: 'XP', value: `${xp} / ${Math.floor(xpForNextLevel)}`, inline: true },
        { name: 'Progress', value: `${progress}%`, inline: false },
      );

    await interaction.reply({ embeds: [embed] });
  },
};
