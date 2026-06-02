const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');
const db = require('../../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role-delete')
    .setDescription('Delete a role')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addRoleOption(opt => opt.setName('role').setDescription('Role to delete').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for this action').setRequired(false)),
  execute: async (interaction, client) => {
    const role = interaction.options.getRole('role');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!role.editable) return interaction.reply({ embeds: [embeds.error('Error', 'That role cannot be deleted.')], ephemeral: true });

    const name = role.name;
    await role.delete(reason);
    logger.info(`Role ${name} deleted by ${interaction.user.tag}`);
    await interaction.reply({ embeds: [embeds.success('Role Deleted', `Deleted role **${name}**`)] });
  }
};
