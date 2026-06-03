const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');
const db = require('../../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnlogs')
    .setDescription('View all warnings for a user')
    .addUserOption(o => o.setName('user').setDescription('User to check warnings for').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const warnings = db.get(interaction.guildId, 'warnings') || [];
    const userWarnings = warnings.filter(w => w.userId === target.id);

    if (userWarnings.length === 0) {
      return interaction.reply({ embeds: [embeds.info('Warnings', `${target.tag} has no warnings.`)] });
    }

    const desc = userWarnings.map((w, i) =>
      `**#${i + 1}** - ${w.reason}\nModerator: ${w.moderator}\n<t:${Math.floor(new Date(w.date).getTime() / 1000)}:f>`
    ).join('\n\n');

    logger.info(`${interaction.user.tag} checked warnings for ${target.tag} (${userWarnings.length} total)`);
    await interaction.reply({ embeds: [embeds.info(`Warnings for ${target.tag}`, desc)] });
  },
};
