const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleinfo')
    .setDescription('Show role information')
    .addRoleOption(o => o.setName('role').setDescription('Target role').setRequired(true)),
  async execute(interaction) {
    const role = interaction.options.getRole('role');

    const perms = role.permissions.toArray().map(p => p.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())).join(', ') || 'None';

    const embed = embeds.info(role.name)
      .addFields(
        { name: 'ID', value: role.id, inline: true },
        { name: 'Color', value: role.hexColor.toUpperCase(), inline: true },
        { name: 'Position', value: `${role.position}`, inline: true },
        { name: 'Hoist', value: role.hoist ? 'Yes' : 'No', inline: true },
        { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
        { name: 'Members', value: `${role.members.size}`, inline: true },
        { name: 'Created', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Permissions', value: perms.length > 1024 ? `${perms.slice(0, 1020)}...` : perms },
      );

    await interaction.reply({ embeds: [embed] });
  },
};
