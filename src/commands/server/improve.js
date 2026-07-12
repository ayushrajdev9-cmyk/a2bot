const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, GuildVerificationLevel, EmbedBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const db = require('../../utils/database');
const logger = require('../../utils/logger');

const KNOWN_KEYWORDS = [
  'welcome', 'rules', 'announcements', 'general-chat', 'general', 'suggestions',
  'help', 'mod-chat', 'bot-logs', 'media-share', 'self-promo', 'game-chat',
  'looking-to-play', 'looking-for-group', 'ticket-logs', 'music-requests',
  'clips-media', 'memes', 'giveaways', 'trivia', 'mini-games', 'contests',
  'tournaments', 'valorant', 'cs2', 'fortnite', 'minecraft', 'other-games',
  'clan-recruitment', 'python', 'javascript', 'rust', 'java', 'devops',
  'code-review', 'general-dev', 'help-questions', 'resources', 'feature-ideas',
  'deploy-logs', 'bug-reports', 'pull-requests', 'sprints', 'node-us-east',
  'node-eu-west', 'node-asia', 'resource-monitor', 'support-tickets', 'billing',
  'order-status', 'linux-help', 'docker', 'cloud-stack', 'security',
  'staff-chat', 'admin-logs', 'server-status', 'art-creations', 'selfies-photos',
  'voice-requests', 'events',
];

const KNOWN_ROLES = ['Admin', 'Moderator', 'Member', 'Bot', 'Owner', 'Pro Gamer', 'Lead Dev', 'Developer', 'Tech Support', 'Sales', 'Customer', 'Party Host', 'Game Master'];

const CATEGORY_KEYWORDS = [
  'information', 'community', 'voice', 'gaming', 'support', 'admin',
  'game chats', 'lfg', 'chill', 'projects', 'collab', 'ci/cd',
  'nodes', 'customers', 'tech', 'staff', 'fun zone', 'games', 'media',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('improve')
    .setDescription('🔧 Analyze and optimize your server')
    .addSubcommand(s => s.setName('analyze').setDescription('📊 Get a detailed server health report with suggestions'))
    .addSubcommand(s => s.setName('cleanup').setDescription('🧹 Remove channels not in the recommended template structure'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const sub = interaction.options.getSubcommand();
    if (sub === 'cleanup') return cleanup(interaction);
    return analyze(interaction);
  },
};

function fuzzyMatch(name, keyword) {
  const a = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const b = keyword.toLowerCase().replace(/[^a-z0-9]/g, '');
  return a.includes(b) || b.includes(a);
}

async function analyze(interaction) {
  const guild = interaction.guild;
  const tips = [];

  const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
  const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
  const categories = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;
  const existingNames = guild.channels.cache.map(c => c.name.toLowerCase());
  const existingRoles = guild.roles.cache.map(r => r.name);
  const guildData = db.get('guilds', guild.id) || {};

  // Missing core channels (fuzzy match)
  const coreChecks = ['welcome', 'rules', 'announcements', 'general'];
  const missingCore = coreChecks.filter(kw => !existingNames.some(n => fuzzyMatch(n, kw)));
  if (missingCore.length) {
    tips.push(`➕ **Core Channels Missing:** Create \`${missingCore.join('`, `')}\` with \`/setup\``);
  }

  // Missing useful channels
  const usefulChecks = ['suggestions', 'help', 'mod-chat', 'bot-logs', 'media-share'];
  const missingUseful = usefulChecks.filter(kw => !existingNames.some(n => fuzzyMatch(n, kw)));
  if (missingUseful.length) {
    tips.push(`💡 **Recommended Channels:** \`${missingUseful.join('`, `')}\` — run \`/setup\``);
  }

  // Missing roles
  const roleChecks = ['Admin', 'Moderator', 'Member'];
  const missingRoles = roleChecks.filter(r => !existingRoles.some(er => fuzzyMatch(er, r)));
  if (missingRoles.length) {
    tips.push(`➕ **Missing Roles:** \`${missingRoles.join('`, `')}\` — run \`/setup\``);
  }

  // Extra channels not matching any known pattern
  const allKnownNames = [...KNOWN_KEYWORDS, ...CATEGORY_KEYWORDS];
  const extraChannels = guild.channels.cache.filter(c =>
    (c.type === ChannelType.GuildText || c.type === ChannelType.GuildVoice) &&
    !allKnownNames.some(kw => fuzzyMatch(c.name, kw)) &&
    c.name !== 'general'
  );
  if (extraChannels.size > 0) {
    tips.push(`🗑️ **${extraChannels.size} Unrecognized Channels** — consider cleaning up with \`/improve cleanup\``);
  }

  // Too few categories
  if (categories < 3) {
    tips.push('📂 **Add Categories** — organize channels into 3+ category groups for a clean sidebar');
  }

  // Verification level
  if (guild.verificationLevel === GuildVerificationLevel.None) {
    tips.push('🔒 **Set Verification Level** to **Low** to prevent raiders and bots');
  }

  // Auto-role
  if (!guildData.autoRole) {
    tips.push('⚙️ **Set Auto-Role** for new members with \`/roles set-autorole\`');
  }

  // Boost
  if (!guild.premiumTier) {
    tips.push('🚀 **Encourage Boosts** for higher audio quality, more emoji slots, and a custom banner');
  }

  // Emojis
  if (guild.emojis.cache.size < 3) {
    tips.push('😄 **Add Custom Emojis** — make your server more expressive and fun');
  }

  // Suggestion channel
  if (!guildData.suggestionChannel) {
    tips.push('💡 **Set Up Suggestions** — create a #suggestions channel and run \`/setup\` to configure it');
  }

  // Channels without categories
  const uncategorized = guild.channels.cache.filter(c =>
    (c.type === ChannelType.GuildText || c.type === ChannelType.GuildVoice) &&
    !c.parentId
  );
  if (uncategorized.size > 0) {
    tips.push(`📁 **${uncategorized.size} Unorganized Channels** — move them into categories for a tidy server`);
  }

  // Member count vs channel ratio
  const totalChannels = textChannels + voiceChannels;
  if (guild.memberCount < 10 && totalChannels > 15) {
    tips.push('📉 **Too Many Channels** — for a small server, simplify to avoid overwhelming new members');
  }

  // Music channels
  const hasMusic = existingNames.some(n => fuzzyMatch(n, 'music'));
  if (!hasMusic) {
    tips.push('🎵 **Add Music Channels** — create a #music-requests text and Music Lounge voice for vibe sessions');
  }

  const score = Math.min(100, Math.max(10,
    100
    - (missingCore.length * 12)
    - (missingRoles.length * 10)
    - (guild.verificationLevel === GuildVerificationLevel.None ? 10 : 0)
    - (!guildData.autoRole ? 5 : 0)
    - (categories < 3 ? 8 : 0)
    - (extraChannels.size * 2)
  ));
  const rating = score >= 80 ? '🟢 **Great Shape**' : score >= 50 ? '🟡 **Could Improve**' : '🔴 **Needs Attention**';

  const embed = new EmbedBuilder()
    .setColor(score >= 80 ? 0x57F287 : score >= 50 ? 0xFEE75C : 0xED4245)
    .setTitle(`📋 ${guild.name} — Server Health`)
    .setThumbnail(guild.iconURL({ size: 128 }))
    .setDescription(`### **Score:** ${score}/100 — ${rating}`)
    .addFields(
      {
        name: '📊 Overview',
        value: [
          `**${textChannels}** text · **${voiceChannels}** voice · **${categories}** categories`,
          `**${guild.roles.cache.size}** roles · **${guild.memberCount}** members · **${guild.premiumSubscriptionCount || 0}** boosts`,
        ].join('\n'),
        inline: false,
      },
      {
        name: tips.length ? '💡 Suggestions & Tips' : '✅ All Good!',
        value: tips.length
          ? tips.map((t, i) => `${i + 1}. ${t}`).join('\n')
          : 'Your server is in excellent shape! Keep up the great work 🏆',
        inline: false,
      },
      {
        name: '🛠️ Quick Actions',
        value: [
          '📌 \`/setup\` — use a template to create channels & roles',
          '🧹 \`/improve cleanup\` — remove unrecognized channels',
          '⚙️ \`/roles set-autorole\` — auto-assign role to new members',
        ].join('\n'),
        inline: false,
      }
    )
    .setFooter({ text: 'Run /setup to pick a template and auto-fix most issues' })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
  logger.info(`Improve analyze done for ${guild.name} — Score: ${score}/100`);
}

async function cleanup(interaction) {
  const guild = interaction.guild;
  let removed = { text: 0, voice: 0 };

  const channels = guild.channels.cache.filter(c =>
    (c.type === ChannelType.GuildText || c.type === ChannelType.GuildVoice) &&
    !KNOWN_KEYWORDS.some(kw => fuzzyMatch(c.name, kw)) &&
    !CATEGORY_KEYWORDS.some(kw => fuzzyMatch(c.name, kw)) &&
    c.name !== 'general'
  );

  if (!channels.size) {
    return interaction.editReply({
      embeds: [embeds.info('✅ Cleanup', 'No unrecognized channels found. Your server is tidy!')],
    });
  }

  for (const ch of channels.values()) {
    try {
      await ch.delete('Cleanup by /improve cleanup');
      if (ch.type === ChannelType.GuildVoice) removed.voice++;
      else removed.text++;
    } catch {}
  }

  const parts = [];
  if (removed.text) parts.push(`**${removed.text}** text`);
  if (removed.voice) parts.push(`**${removed.voice}** voice`);
  const total = removed.text + removed.voice;

  await interaction.editReply({
    embeds: [embeds.success('🧹 Cleanup Complete', [
      `Removed **${total}** unrecognized channel(s) (${parts.join(', ')}).`,
      'Run \`/improve analyze\` to see the updated report.',
      '',
      '💡 Tip: Use \`/setup\` to add recommended channels from a template.',
    ].join('\n'))],
  });

  logger.info(`Improve cleanup done for ${guild.name} — removed ${total} channels`);
}
