const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock a channel (deny SendMessages for @everyone)')
    .addStringOption(o => o.setName('reason').setDescription('Reason for locking the channel'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction) {
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const channel = interaction.channel;
    const everyone = interaction.guild.roles.everyone;

    await channel.permissionOverwrites.edit(everyone, { SendMessages: false });
    logger.info(`${interaction.user.tag} locked #${channel.name}: ${reason}`);
    await interaction.reply({ embeds: [embeds.success('Channel Locked', `#${channel.name} has been locked.\nReason: ${reason}`)] });
  },
};
