const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, GuildVerificationLevel } = require('discord.js');
const embeds = require('../../utils/embeds');
const db = require('../../utils/database');

const RECOMMENDED_CHANNELS = [
  'welcome', 'rules', 'announcements', 'general-chat',
  'suggestions', 'help', 'mod-chat', 'bot-logs',
];

const RECOMMENDED_ROLES = ['Admin', 'Moderator', 'Member'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('improve')
    .setDescription('Analyze the server and suggest improvements')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    const recommendations = [];

    // 1. Check channels
    const existingChannels = guild.channels.cache.map(c => c.name);
    for (const ch of RECOMMENDED_CHANNELS) {
      if (!existingChannels.includes(ch)) {
        recommendations.push(`Missing channel: \`#${ch}\``);
      }
    }

    // 2. Check roles
    const existingRoles = guild.roles.cache.map(r => r.name);
    for (const r of RECOMMENDED_ROLES) {
      if (!existingRoles.includes(r)) {
        recommendations.push(`Missing role: \`${r}\``);
      }
    }

    // 3. Check verification level
    if (guild.verificationLevel === GuildVerificationLevel.None) {
      recommendations.push('Verification level is **None**. Consider setting it to **Low** to prevent raiders.');
    }

    // 4. Check 2FA
    if (!guild.mfaLevel) {
      recommendations.push('2FA is **not required** for admin actions. Consider enabling it for security.');
    }

    // 5. Check explicit content filter
    if (guild.explicitContentFilter === 0) {
      recommendations.push('Explicit content filter is **disabled**. Consider enabling it.');
    }

    // 6. Check boost status
    if (!guild.premiumTier) {
      recommendations.push('Server has **no boosts**. Encourage boosts for more features!');
    }

    // 7. Channel diversity
    const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
    const categories = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;

    if (textChannels < 3) recommendations.push('Server needs more text channels for organization.');
    if (voiceChannels < 1) recommendations.push('Add at least one voice channel for voice chat.');
    if (categories < 2) recommendations.push('Use categories to organize your channels better.');

    // 8. Emoji check
    if (guild.emojis.cache.size < 3) {
      recommendations.push('Add some custom emojis to make the server more fun!');
    }

    // 9. Sticker check
    if (guild.stickers.cache.size < 1) {
      recommendations.push('Add some custom stickers for engagement.');
    }

    // 10. Check welcome/suggestion config
    const guildData = db.get('guilds', guild.id) || {};
    if (!guildData.welcomeChannel) {
      recommendations.push('Set up a welcome channel with \`/roles set-welcome\`.');
    }
    if (!guildData.autoRole) {
      recommendations.push('Configure an auto-role with \`/roles set-autorole\`.');
    }
    if (!guildData.suggestionChannel) {
      recommendations.push('Set up a suggestions channel with \`/roles set-suggestions\`.');
    }

    const score = Math.max(0, 100 - (recommendations.length * 10));
    const rating = score >= 80 ? '🟢 Excellent' : score >= 50 ? '🟡 Needs Work' : '🔴 Poor';

    const embed = embeds.info('Server Improvement Report')
      .setDescription(`**Server:** ${guild.name}\n**Score:** ${score}/100 (${rating})`)
      .addFields(
        { name: '📊 Stats', value: `${textChannels} text · ${voiceChannels} voice · ${categories} categories · ${guild.roles.cache.size} roles`, inline: false },
        { name: '💡 Recommendations', value: recommendations.length ? recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n') : '✅ Your server looks great!', inline: false },
        { name: '⚡ Quick Fix', value: 'Run \`/setup\` to auto-create missing channels and roles.', inline: false }
      );

    await interaction.editReply({ embeds: [embed] });
  },
};
