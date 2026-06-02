const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');
const db = require('../../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin-announce')
    .setDescription('Send a formatted announcement embed to a channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(opt => opt.setName('channel').setDescription('Target channel').setRequired(true).addChannelTypes(ChannelType.GuildText))
    .addStringOption(opt => opt.setName('title').setDescription('Announcement title').setRequired(true))
    .addStringOption(opt => opt.setName('message').setDescription('Announcement message').setRequired(true))
    .addStringOption(opt => opt.setName('color').setDescription('Embed color (hex, e.g. #00AAFF)').setRequired(false))
    .addStringOption(opt => opt.setName('ping').setDescription('Role or user to ping').setRequired(false)),
  execute: async (interaction, client) => {
    const channel = interaction.options.getChannel('channel');
    const title = interaction.options.getString('title');
    const message = interaction.options.getString('message');
    const color = interaction.options.getString('color') || '#00AAFF';
    const ping = interaction.options.getString('ping');

    const embed = embeds.info(title, message).setColor(color);
    await channel.send({ embeds: [embed] });
    if (ping) await channel.send({ content: ping });

    logger.info(`Announcement sent to #${channel.name} by ${interaction.user.tag}`);
    await interaction.reply({ embeds: [embeds.success('Announcement Sent', `Message delivered to ${channel}`)], ephemeral: true });
  }
};
