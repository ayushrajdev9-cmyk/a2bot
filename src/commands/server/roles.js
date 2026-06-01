const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const db = require('../../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roles')
    .setDescription('Manage server role settings')
    .addSubcommand(s => s.setName('set-welcome').setDescription('Set welcome channel').addChannelOption(o => o.setName('channel').setDescription('Channel').setRequired(true)))
    .addSubcommand(s => s.setName('set-suggestions').setDescription('Set suggestion channel').addChannelOption(o => o.setName('channel').setDescription('Channel').setRequired(true)))
    .addSubcommand(s => s.setName('set-autorole').setDescription('Set auto-role for new members').addRoleOption(o => o.setName('role').setDescription('Role').setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    let data = db.get('guilds', guildId) || {};

    switch (sub) {
      case 'set-welcome': {
        data.welcomeChannel = interaction.options.getChannel('channel').id;
        db.set('guilds', guildId, data);
        await interaction.reply({ embeds: [embeds.success('Set', 'Welcome channel configured.')] });
        break;
      }
      case 'set-suggestions': {
        data.suggestionChannel = interaction.options.getChannel('channel').id;
        db.set('guilds', guildId, data);
        await interaction.reply({ embeds: [embeds.success('Set', 'Suggestion channel configured.')] });
        break;
      }
      case 'set-autorole': {
        data.autoRole = interaction.options.getRole('role').id;
        db.set('guilds', guildId, data);
        await interaction.reply({ embeds: [embeds.success('Set', 'Auto-role configured.')] });
        break;
      }
    }
  },
};
