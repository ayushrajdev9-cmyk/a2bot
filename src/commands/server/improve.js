const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, GuildVerificationLevel } = require('discord.js');
const embeds = require('../../utils/embeds');
const db = require('../../utils/database');

const CORE_CHANNELS = ['welcome', 'rules', 'announcements', 'general-chat'];
const OPTIONAL_CHANNELS = ['suggestions', 'help', 'mod-chat', 'bot-logs', 'media-share', 'self-promo', 'game-chat', 'looking-to-play'];
const CORE_ROLES = ['Admin', 'Moderator', 'Member'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('improve')
    .setDescription('Analyze and optimize your server')
    .addSubcommand(s => s.setName('analyze').setDescription('Get a server health report with suggestions'))
    .addSubcommand(s => s.setName('cleanup').setDescription('Remove channels and roles not in the recommended structure'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const sub = interaction.options.getSubcommand();
    if (sub === 'cleanup') return cleanup(interaction);
    return analyze(interaction);
  },
};

async function analyze(interaction) {
  const guild = interaction.guild;
  const tips = [];

  const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
  const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
  const categories = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;
  const existingNames = guild.channels.cache.map(c => c.name.toLowerCase());
  const existingRoles = guild.roles.cache.map(r => r.name);
  const guildData = db.get('guilds', guild.id) || {};

  // Missing core channels
  const missingCore = CORE_CHANNELS.filter(c => !existingNames.includes(c));
  if (missingCore.length) tips.push(`➕ Add missing core channels: ${missingCore.map(c => `\`#${c}\``).join(', ')}`);

  // Extra channels not in recommended lists
  const allRecommended = [...CORE_CHANNELS, ...OPTIONAL_CHANNELS];
  const extraChannels = guild.channels.cache.filter(c =>
    c.type === ChannelType.GuildText && !allRecommended.includes(c.name.toLowerCase())
  );
  if (extraChannels.size > 3) {
    tips.push(`🗑️ You have ${extraChannels.size} extra text channels. Run \`/improve cleanup\` to remove unused ones.`);
  }

  // Missing roles
  const missingRoles = CORE_ROLES.filter(r => !existingRoles.includes(r));
  if (missingRoles.length) tips.push(`➕ Create missing roles: ${missingRoles.map(r => `\`${r}\``).join(', ')}`);

  // Verification
  if (guild.verificationLevel === GuildVerificationLevel.None) {
    tips.push('🔒 Set verification level to **Low** to prevent raiders (Server Settings → Moderation).');
  }

  // Auto-role
  if (!guildData.autoRole) {
    tips.push('⚙️ Set an auto-role for new members with \`/roles set-autorole\`.');
  }

  // Boost
  if (!guild.premiumTier) {
    tips.push('🚀 Encourage server boosts for more features like higher audio quality and emoji slots.');
  }

  // Emojis
  if (guild.emojis.cache.size < 3) {
    tips.push('😄 Add some custom emojis to make chat more fun.');
  }

  const totalChannels = textChannels + voiceChannels;
  const score = Math.min(100, Math.max(10, 100 - (missingCore.length * 15) - (missingRoles.length * 10) - (guild.verificationLevel === GuildVerificationLevel.None ? 10 : 0) - (!guildData.autoRole ? 5 : 0)));
  const rating = score >= 80 ? '🟢 Great Shape' : score >= 50 ? '🟡 Could Improve' : '🔴 Needs Attention';

  const embed = embeds.info(`📋 ${guild.name} — Server Health`)
    .setDescription(`**Score:** ${score}/100 — ${rating}`)
    .addFields(
      { name: '📊 Overview', value: `${textChannels} text · ${voiceChannels} voice · ${categories} categories · ${guild.roles.cache.size} roles · ${guild.memberCount} members`, inline: false },
      { name: tips.length ? '💡 Suggestions' : '✅ All Good', value: tips.length ? tips.map((t, i) => `${i + 1}. ${t}`).join('\n') : 'Your server is well configured!', inline: false },
      { name: '🛠️ Quick Actions', value: '\`/setup\` — create missing channels/roles\n\`/improve cleanup\` — remove unnecessary channels', inline: false }
    );

  await interaction.editReply({ embeds: [embed] });
}

async function cleanup(interaction) {
  const guild = interaction.guild;
  const allRecommended = [...CORE_CHANNELS, ...OPTIONAL_CHANNELS];
  let removed = 0;

  const channels = guild.channels.cache.filter(c =>
    (c.type === ChannelType.GuildText || c.type === ChannelType.GuildVoice) &&
    !allRecommended.includes(c.name.toLowerCase()) &&
    c.name !== 'general'
  );

  if (!channels.size) {
    return interaction.editReply({ embeds: [embeds.info('✅ Cleanup', 'No unnecessary channels found.')] });
  }

  for (const ch of channels.values()) {
    try {
      await ch.delete('Cleanup by /improve cleanup');
      removed++;
    } catch {}
  }

  await interaction.editReply({
    embeds: [embeds.success('🧹 Cleanup Complete', `Removed **${removed}** channel(s) that weren't in the recommended structure.\nRun \`/improve analyze\` to see the updated report.`)]
  });
}
