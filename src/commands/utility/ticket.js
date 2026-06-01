const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Create a support ticket')
    .addStringOption(o => o.setName('reason').setDescription('Reason for the ticket').setRequired(true)),
  async execute(interaction) {
    const reason = interaction.options.getString('reason');

    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
      ],
    });

    logger.info(`Ticket created for ${interaction.user.tag}: #${channel.name}`);
    await interaction.reply({ embeds: [embeds.success('Ticket Created', `Your ticket has been created: ${channel}`)], ephemeral: true });
    await channel.send({ embeds: [embeds.info('Support Ticket', `**User:** ${interaction.user}\n**Reason:** ${reason}\n\nStaff will be with you shortly.`)] });
  },
};
