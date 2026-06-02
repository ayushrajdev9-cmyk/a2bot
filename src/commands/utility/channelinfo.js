const { SlashCommandBuilder, ChannelType } = require('discord.js');
const embeds = require('../../utils/embeds');

const channelTypeNames = {
  [ChannelType.GuildText]: 'Text',
  [ChannelType.GuildVoice]: 'Voice',
  [ChannelType.GuildCategory]: 'Category',
  [ChannelType.GuildAnnouncement]: 'Announcement',
  [ChannelType.AnnouncementThread]: 'Announcement Thread',
  [ChannelType.PublicThread]: 'Public Thread',
  [ChannelType.PrivateThread]: 'Private Thread',
  [ChannelType.GuildStageVoice]: 'Stage',
  [ChannelType.GuildForum]: 'Forum',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('channelinfo')
    .setDescription('Show channel information')
    .addChannelOption(o => o.setName('channel').setDescription('Target channel')),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    const embed = embeds.info(`#${channel.name}`)
      .addFields(
        { name: 'ID', value: channel.id, inline: true },
        { name: 'Type', value: channelTypeNames[channel.type] || 'Unknown', inline: true },
        { name: 'Position', value: `${channel.position ?? 'N/A'}`, inline: true },
        { name: 'Topic', value: channel.topic || 'None' },
        { name: 'NSFW', value: channel.nsfw ? 'Yes' : 'No', inline: true },
        { name: 'Slowmode', value: channel.rateLimitPerUser ? `${channel.rateLimitPerUser}s` : 'Off', inline: true },
        { name: 'Created', value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:R>`, inline: true },
      );

    await interaction.reply({ embeds: [embed] });
  },
};
