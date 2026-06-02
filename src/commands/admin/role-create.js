const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');
const db = require('../../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role-create')
    .setDescription('Create a new role')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addStringOption(opt => opt.setName('name').setDescription('Role name').setRequired(true))
    .addStringOption(opt => opt.setName('color').setDescription('Role color (hex, e.g. #FF0000)').setRequired(false))
    .addBooleanOption(opt => opt.setName('hoist').setDescription('Display role separately').setRequired(false))
    .addBooleanOption(opt => opt.setName('mentionable').setDescription('Allow anyone to mention this role').setRequired(false))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for this action').setRequired(false)),
  execute: async (interaction, client) => {
    const name = interaction.options.getString('name');
    const color = interaction.options.getString('color') || '#000000';
    const hoist = interaction.options.getBoolean('hoist') || false;
    const mentionable = interaction.options.getBoolean('mentionable') || false;
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const role = await interaction.guild.roles.create({ name, color, hoist, mentionable, reason });
    logger.info(`Role ${role.name} created by ${interaction.user.tag}`);
    await interaction.reply({ embeds: [embeds.success('Role Created', `Created role ${role}`)] });
  }
};
