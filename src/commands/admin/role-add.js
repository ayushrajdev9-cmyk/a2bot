const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');
const db = require('../../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role-add')
    .setDescription('Add a role to a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addUserOption(opt => opt.setName('user').setDescription('Target user').setRequired(true))
    .addRoleOption(opt => opt.setName('role').setDescription('Role to add').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for this action').setRequired(false)),
  execute: async (interaction, client) => {
    const user = interaction.options.getMember('user');
    const role = interaction.options.getRole('role');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!user) return interaction.reply({ embeds: [embeds.error('Error', 'User not found in this server.')], ephemeral: true });
    if (user.roles.cache.has(role.id)) return interaction.reply({ embeds: [embeds.warning('Warning', 'User already has that role.')], ephemeral: true });

    await user.roles.add(role, reason);
    logger.info(`Role ${role.name} added to ${user.user.tag} by ${interaction.user.tag}`);
    await interaction.reply({ embeds: [embeds.success('Role Added', `Added ${role} to ${user.user}`)] });
  }
};
