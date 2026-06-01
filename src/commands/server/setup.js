const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const embeds = require('../../utils/embeds');
const db = require('../../utils/database');
const logger = require('../../utils/logger');

const STRUCTURE = {
  categories: [
    {
      name: 'INFORMATION',
      channels: [
        { name: 'welcome', type: ChannelType.GuildText },
        { name: 'rules', type: ChannelType.GuildText },
        { name: 'announcements', type: ChannelType.GuildText },
      ],
    },
    {
      name: 'COMMUNITY',
      channels: [
        { name: 'general-chat', type: ChannelType.GuildText },
        { name: 'media-share', type: ChannelType.GuildText },
        { name: 'self-promo', type: ChannelType.GuildText },
        { name: 'suggestions', type: ChannelType.GuildText },
      ],
    },
    {
      name: 'VOICE CHANNELS',
      channels: [
        { name: 'General Voice', type: ChannelType.GuildVoice },
        { name: 'Music Lounge', type: ChannelType.GuildVoice },
        { name: 'AFK', type: ChannelType.GuildVoice },
      ],
    },
    {
      name: 'GAMING',
      channels: [
        { name: 'game-chat', type: ChannelType.GuildText },
        { name: 'looking-to-play', type: ChannelType.GuildText },
        { name: 'Game Voice', type: ChannelType.GuildVoice },
      ],
    },
    {
      name: 'SUPPORT',
      channels: [
        { name: 'help', type: ChannelType.GuildText },
        { name: 'ticket-logs', type: ChannelType.GuildText },
      ],
    },
    {
      name: 'ADMIN',
      channels: [
        { name: 'mod-chat', type: ChannelType.GuildText },
        { name: 'bot-logs', type: ChannelType.GuildText },
        { name: 'admin-voice', type: ChannelType.GuildVoice },
      ],
    },
  ],
  roles: [
    { name: 'Admin', color: 'Red', permissions: [PermissionFlagsBits.Administrator] },
    { name: 'Moderator', color: 'Blue', permissions: [PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.KickMembers, PermissionFlagsBits.BanMembers, PermissionFlagsBits.ManageMessages] },
    { name: 'Member', color: 'Green', permissions: [] },
    { name: 'Bot', color: 'Purple', permissions: [] },
  ],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Auto-setup a complete Discord server structure')
    .addStringOption(o => o.setName('name').setDescription('Server name (leave blank to keep current)'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    const results = { roles: 0, categories: 0, channels: 0 };

    // 1. Create roles
    for (const rdef of STRUCTURE.roles) {
      const existing = guild.roles.cache.find(r => r.name === rdef.name);
      if (!existing) {
        await guild.roles.create({
          name: rdef.name,
          color: rdef.color,
          permissions: rdef.permissions,
          reason: 'Server setup by a2bot',
        });
        results.roles++;
      }
    }

    // 2. Create categories and channels
    for (const cat of STRUCTURE.categories) {
      const existingCat = guild.channels.cache.find(
        c => c.type === ChannelType.GuildCategory && c.name === cat.name
      );
      const category = existingCat || await guild.channels.create({
        name: cat.name,
        type: ChannelType.GuildCategory,
        reason: 'Server setup by a2bot',
      });
      if (!existingCat) results.categories++;

      for (const ch of cat.channels) {
        const exists = guild.channels.cache.find(
          c => c.name === ch.name && c.parentId === category.id
        );
        if (!exists) {
          await guild.channels.create({
            name: ch.name,
            type: ch.type,
            parent: category.id,
            reason: 'Server setup by a2bot',
          });
          results.channels++;
        }
      }
    }

    // 3. Save suggestion channel reference
    const suggChannel = guild.channels.cache.find(c => c.name === 'suggestions');
    if (suggChannel) {
      const data = db.get('guilds', guild.id) || {};
      data.suggestionChannel = suggChannel.id;
      db.set('guilds', guild.id, data);
    }

    const summary = `**Server setup complete!**\n\n` +
      `- ${results.roles} role(s) created\n` +
      `- ${results.categories} categor(ies) created\n` +
      `- ${results.channels} channel(s) created\n\n` +
      `Existing channels/roles were kept. Run \`/improve\` for analysis.`;

    logger.info(`Server setup done for ${guild.name} (${results.roles}r, ${results.categories}c, ${results.channels}ch)`);
    await interaction.editReply({ embeds: [embeds.success('Server Setup Complete', summary)] });
  },
};
