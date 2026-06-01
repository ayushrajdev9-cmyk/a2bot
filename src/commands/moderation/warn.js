const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const db = require('../../utils/database');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a member')
    .addUserOption(o => o.setName('target').setDescription('Member to warn').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for the warning').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const target = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason');
    const guildId = interaction.guild.id;

    const warning = {
      userId: target.id,
      moderator: interaction.user.tag,
      reason,
      date: new Date().toISOString(),
    };

    db.push(guildId, 'warnings', warning);
    logger.info(`${interaction.user.tag} warned ${target.tag}: ${reason}`);
    await interaction.reply({ embeds: [embeds.success('Warning Issued', `${target.tag} has been warned.\nReason: ${reason}\nTotal warnings: ${db.get(guildId, 'warnings')?.length || 1}`)] });
  },
};
