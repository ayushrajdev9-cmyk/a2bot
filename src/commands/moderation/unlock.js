const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock a channel (allow SendMessages for @everyone)')
    .addStringOption(o => o.setName('reason').setDescription('Reason for unlocking the channel'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction) {
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const channel = interaction.channel;
    const everyone = interaction.guild.roles.everyone;

    await channel.permissionOverwrites.edit(everyone, { SendMessages: null });
    logger.info(`${interaction.user.tag} unlocked #${channel.name}: ${reason}`);
    await interaction.reply({ embeds: [embeds.success('Channel Unlocked', `#${channel.name} has been unlocked.\nReason: ${reason}`)] });
  },
};
