const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const db = require('../../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('level-role')
    .setDescription('Set a role reward for reaching a level')
    .addIntegerOption(o => o.setName('level').setDescription('Level required').setRequired(true).setMinValue(1))
    .addRoleOption(o => o.setName('role').setDescription('Role to reward').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const level = interaction.options.getInteger('level');
    const role = interaction.options.getRole('role');
    const guildId = interaction.guild.id;

    const rewards = db.get('levelRewards', guildId) || {};
    rewards[level] = role.id;
    db.set('levelRewards', guildId, rewards);

    await interaction.reply({ embeds: [embeds.success('Level Role', `Set role ${role} for reaching level **${level}**.`)] });
  },
};
