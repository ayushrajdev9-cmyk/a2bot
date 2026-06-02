const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const db = require('../../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('level-config')
    .setDescription('Configure the leveling system')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable leveling'))
    .addIntegerOption(o => o.setName('multiplier').setDescription('XP multiplier (1-5)').setMinValue(1).setMaxValue(5))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const config = db.get('levelConfig', guildId) || { enabled: true, xpMultiplier: 1 };
    const enabled = interaction.options.getBoolean('enabled');
    const multiplier = interaction.options.getInteger('multiplier');

    if (enabled !== null) config.enabled = enabled;
    if (multiplier !== null) config.xpMultiplier = multiplier;

    db.set('levelConfig', guildId, config);

    await interaction.reply({ embeds: [embeds.success('Level Config', `Leveling **${config.enabled ? 'enabled' : 'disabled'}**\nXP Multiplier: **${config.xpMultiplier}x**`)] });
  },
};
