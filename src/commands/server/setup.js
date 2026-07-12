const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const db = require('../../utils/database');
const logger = require('../../utils/logger');

const TEMPLATES = {
  community: {
    name: '🌐 Community Server',
    description: 'General community with info, chat, support & voice channels',
    categories: [
      { name: '📢 INFORMATION', channels: [
        { name: '👋・welcome', type: ChannelType.GuildText },
        { name: '📋・rules', type: ChannelType.GuildText },
        { name: '📢・announcements', type: ChannelType.GuildText },
      ]},
      { name: '💬 COMMUNITY', channels: [
        { name: '💬・general-chat', type: ChannelType.GuildText },
        { name: '🖼️・media-share', type: ChannelType.GuildText },
        { name: '📣・self-promo', type: ChannelType.GuildText },
        { name: '💡・suggestions', type: ChannelType.GuildText },
      ]},
      { name: '🔊 VOICE', channels: [
        { name: '🔊 General Voice', type: ChannelType.GuildVoice },
        { name: '🎵 Music Lounge', type: ChannelType.GuildVoice },
        { name: '🔇 AFK', type: ChannelType.GuildVoice },
      ]},
      { name: '🎮 GAMING', channels: [
        { name: '🎮・game-chat', type: ChannelType.GuildText },
        { name: '🔍・looking-to-play', type: ChannelType.GuildText },
        { name: '🎧 Game Voice', type: ChannelType.GuildVoice },
      ]},
      { name: '🆘 SUPPORT', channels: [
        { name: '❓・help', type: ChannelType.GuildText },
        { name: '🎫・ticket-logs', type: ChannelType.GuildText },
      ]},
      { name: '⚙️ ADMIN', channels: [
        { name: '🛠️・mod-chat', type: ChannelType.GuildText },
        { name: '📊・bot-logs', type: ChannelType.GuildText },
        { name: '🎙️ Admin Voice', type: ChannelType.GuildVoice },
      ]},
    ],
    roles: [
      { name: '👑 Admin', color: 'Red', permissions: [PermissionFlagsBits.Administrator] },
      { name: '🛡️ Moderator', color: 'Blue', permissions: [PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.KickMembers, PermissionFlagsBits.BanMembers, PermissionFlagsBits.ManageMessages] },
      { name: '👋 Member', color: 'Green', permissions: [] },
      { name: '🤖 Bot', color: 'Purple', permissions: [] },
    ],
  },
  gaming: {
    name: '🎮 Gaming Server',
    description: 'Dedicated gaming hub with LFG, game chats & squad voice',
    categories: [
      { name: '📢 INFORMATION', channels: [
        { name: '👋・welcome', type: ChannelType.GuildText },
        { name: '📋・rules', type: ChannelType.GuildText },
        { name: '📢・announcements', type: ChannelType.GuildText },
        { name: '🏆・tournaments', type: ChannelType.GuildText },
      ]},
      { name: '🎮 GAME CHATS', channels: [
        { name: '🎯・valorant', type: ChannelType.GuildText },
        { name: '🔫・cs2', type: ChannelType.GuildText },
        { name: '🏀・fortnite', type: ChannelType.GuildText },
        { name: '🎲・minecraft', type: ChannelType.GuildText },
        { name: '🕹️・other-games', type: ChannelType.GuildText },
      ]},
      { name: '🤝 LFG', channels: [
        { name: '🔍・looking-for-group', type: ChannelType.GuildText },
        { name: '🏅・clan-recruitment', type: ChannelType.GuildText },
      ]},
      { name: '💬 CHILL', channels: [
        { name: '💬・general-chat', type: ChannelType.GuildText },
        { name: '🖼️・clips-media', type: ChannelType.GuildText },
        { name: '🎵・music-requests', type: ChannelType.GuildText },
      ]},
      { name: '🔊 VOICE', channels: [
        { name: '🎮 Game 1', type: ChannelType.GuildVoice },
        { name: '🎮 Game 2', type: ChannelType.GuildVoice },
        { name: '🎮 Game 3', type: ChannelType.GuildVoice },
        { name: '🎵 Music Lounge', type: ChannelType.GuildVoice },
        { name: '🔇 AFK', type: ChannelType.GuildVoice },
      ]},
      { name: '⚙️ ADMIN', channels: [
        { name: '🛠️・mod-chat', type: ChannelType.GuildText },
        { name: '📊・logs', type: ChannelType.GuildText },
        { name: '🎙️ Staff Voice', type: ChannelType.GuildVoice },
      ]},
    ],
    roles: [
      { name: '👑 Admin', color: 'Red', permissions: [PermissionFlagsBits.Administrator] },
      { name: '🛡️ Moderator', color: 'Blue', permissions: [PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.KickMembers, PermissionFlagsBits.BanMembers, PermissionFlagsBits.ManageMessages] },
      { name: '🎮 Pro Gamer', color: 'Orange', permissions: [] },
      { name: '👋 Member', color: 'Green', permissions: [] },
      { name: '🤖 Bot', color: 'Purple', permissions: [] },
    ],
  },
  development: {
    name: '💻 Development Server',
    description: 'Coding projects, code review, dev-ops & collaboration',
    categories: [
      { name: '📢 INFORMATION', channels: [
        { name: '👋・welcome', type: ChannelType.GuildText },
        { name: '📋・rules', type: ChannelType.GuildText },
        { name: '📢・announcements', type: ChannelType.GuildText },
        { name: '📅・sprints', type: ChannelType.GuildText },
      ]},
      { name: '💻 PROJECTS', channels: [
        { name: '🐍・python', type: ChannelType.GuildText },
        { name: '🟨・javascript', type: ChannelType.GuildText },
        { name: '🦀・rust', type: ChannelType.GuildText },
        { name: '☕・java', type: ChannelType.GuildText },
        { name: '🐳・devops', type: ChannelType.GuildText },
        { name: '🔧・code-review', type: ChannelType.GuildText },
      ]},
      { name: '🤝 COLLAB', channels: [
        { name: '💬・general-dev', type: ChannelType.GuildText },
        { name: '❓・help-questions', type: ChannelType.GuildText },
        { name: '📚・resources', type: ChannelType.GuildText },
        { name: '💡・feature-ideas', type: ChannelType.GuildText },
      ]},
      { name: '🔊 VOICE', channels: [
        { name: '💻 Dev Chat', type: ChannelType.GuildVoice },
        { name: '🎧 Code Review', type: ChannelType.GuildVoice },
        { name: '🔇 AFK', type: ChannelType.GuildVoice },
      ]},
      { name: '🛠️ CI/CD', channels: [
        { name: '📊・deploy-logs', type: ChannelType.GuildText },
        { name: '🐛・bug-reports', type: ChannelType.GuildText },
        { name: '✅・pull-requests', type: ChannelType.GuildText },
      ]},
      { name: '⚙️ ADMIN', channels: [
        { name: '🛠️・mod-chat', type: ChannelType.GuildText },
        { name: '📊・bot-logs', type: ChannelType.GuildText },
      ]},
    ],
    roles: [
      { name: '👑 Admin', color: 'Red', permissions: [PermissionFlagsBits.Administrator] },
      { name: '🛡️ Moderator', color: 'Blue', permissions: [PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.KickMembers, PermissionFlagsBits.BanMembers, PermissionFlagsBits.ManageMessages] },
      { name: '💻 Lead Dev', color: 'DarkGold', permissions: [] },
      { name: '👨‍💻 Developer', color: 'Gold', permissions: [] },
      { name: '👋 Member', color: 'Green', permissions: [] },
      { name: '🤖 Bot', color: 'Purple', permissions: [] },
    ],
  },
  vps: {
    name: '🚀 VPS Hosting',
    description: 'VPS hosting, server management & infrastructure',
    categories: [
      { name: '📢 INFORMATION', channels: [
        { name: '👋・welcome', type: ChannelType.GuildText },
        { name: '📋・rules', type: ChannelType.GuildText },
        { name: '📢・announcements', type: ChannelType.GuildText },
        { name: '📊・server-status', type: ChannelType.GuildText },
      ]},
      { name: '🖥️ NODES', channels: [
        { name: '🌍・node-us-east', type: ChannelType.GuildText },
        { name: '🌍・node-eu-west', type: ChannelType.GuildText },
        { name: '🌍・node-asia', type: ChannelType.GuildText },
        { name: '📈・resource-monitor', type: ChannelType.GuildText },
      ]},
      { name: '🎮 CUSTOMERS', channels: [
        { name: '💬・general-chat', type: ChannelType.GuildText },
        { name: '🎫・support-tickets', type: ChannelType.GuildText },
        { name: '💳・billing', type: ChannelType.GuildText },
        { name: '📦・order-status', type: ChannelType.GuildText },
      ]},
      { name: '🛠️ TECH', channels: [
        { name: '🐧・linux-help', type: ChannelType.GuildText },
        { name: '🐳・docker', type: ChannelType.GuildText },
        { name: '☁️・cloud-stack', type: ChannelType.GuildText },
        { name: '🔐・security', type: ChannelType.GuildText },
      ]},
      { name: '🔊 VOICE', channels: [
        { name: '🖥️ Ops Room', type: ChannelType.GuildVoice },
        { name: '🎧 Support', type: ChannelType.GuildVoice },
        { name: '🔇 AFK', type: ChannelType.GuildVoice },
      ]},
      { name: '⚙️ STAFF', channels: [
        { name: '🛠️・staff-chat', type: ChannelType.GuildText },
        { name: '📊・admin-logs', type: ChannelType.GuildText },
        { name: '🎙️ Staff Voice', type: ChannelType.GuildVoice },
      ]},
    ],
    roles: [
      { name: '👑 Owner', color: 'Red', permissions: [PermissionFlagsBits.Administrator] },
      { name: '🛡️ Admin', color: 'DarkRed', permissions: [PermissionFlagsBits.Administrator] },
      { name: '🔧 Tech Support', color: 'Blue', permissions: [PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.ManageMessages] },
      { name: '💳 Sales', color: 'Gold', permissions: [] },
      { name: '👋 Customer', color: 'Green', permissions: [] },
      { name: '🤖 Bot', color: 'Purple', permissions: [] },
    ],
  },
  fun: {
    name: '🎉 Fun Server',
    description: 'Party & entertainment with games, memes, music & events',
    categories: [
      { name: '📢 INFORMATION', channels: [
        { name: '👋・welcome', type: ChannelType.GuildText },
        { name: '📋・rules', type: ChannelType.GuildText },
        { name: '📢・announcements', type: ChannelType.GuildText },
        { name: '🎪・events', type: ChannelType.GuildText },
      ]},
      { name: '🎉 FUN ZONE', channels: [
        { name: '💬・general-chat', type: ChannelType.GuildText },
        { name: '🔥・memes', type: ChannelType.GuildText },
        { name: '🎬・clips-videos', type: ChannelType.GuildText },
        { name: '🎨・art-creations', type: ChannelType.GuildText },
      ]},
      { name: '🎮 GAMES', channels: [
        { name: '🎲・mini-games', type: ChannelType.GuildText },
        { name: '🧩・trivia', type: ChannelType.GuildText },
        { name: '🏆・giveaways', type: ChannelType.GuildText },
        { name: '🎯・contests', type: ChannelType.GuildText },
      ]},
      { name: '🎵 MEDIA', channels: [
        { name: '🎵・music-requests', type: ChannelType.GuildText },
        { name: '📸・selfies-photos', type: ChannelType.GuildText },
        { name: '🎙️・voice-requests', type: ChannelType.GuildText },
      ]},
      { name: '🔊 VOICE', channels: [
        { name: '🎉 Party Zone', type: ChannelType.GuildVoice },
        { name: '🎵 Music Room', type: ChannelType.GuildVoice },
        { name: '🎮 Game Room', type: ChannelType.GuildVoice },
        { name: '🔇 AFK', type: ChannelType.GuildVoice },
      ]},
      { name: '⚙️ ADMIN', channels: [
        { name: '🛠️・mod-chat', type: ChannelType.GuildText },
        { name: '📊・logs', type: ChannelType.GuildText },
        { name: '🎙️ Staff Voice', type: ChannelType.GuildVoice },
      ]},
    ],
    roles: [
      { name: '👑 Admin', color: 'Red', permissions: [PermissionFlagsBits.Administrator] },
      { name: '🛡️ Moderator', color: 'Blue', permissions: [PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.KickMembers, PermissionFlagsBits.BanMembers, PermissionFlagsBits.ManageMessages] },
      { name: '🎉 Party Host', color: 'Gold', permissions: [] },
      { name: '🎮 Game Master', color: 'Orange', permissions: [] },
      { name: '👋 Member', color: 'Green', permissions: [] },
      { name: '🤖 Bot', color: 'Purple', permissions: [] },
    ],
  },
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('🚀 Auto-setup a complete Discord server with templates')
    .addStringOption(o =>
      o.setName('template')
        .setDescription('Choose a server template (or leave blank to pick interactively)')
        .addChoices(
          { name: '🌐 Community Server', value: 'community' },
          { name: '🎮 Gaming Server', value: 'gaming' },
          { name: '💻 Development Server', value: 'development' },
          { name: '🚀 VPS Hosting', value: 'vps' },
          { name: '🎉 Fun Server', value: 'fun' },
        ))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const templateChoice = interaction.options.getString('template');

    if (templateChoice) {
      await runSetup(interaction, TEMPLATES[templateChoice]);
      return;
    }

    await showTemplatePicker(interaction);
  },
};

async function showTemplatePicker(interaction) {
  await interaction.deferReply();

  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle('🏗️ Server Setup Wizard')
    .setDescription(
      'Choose a template to automatically create channels, categories, and roles for your server!\n\n' +
      Object.values(TEMPLATES).map(t =>
        `${t.name} — *${t.description}*`
      ).join('\n') +
      '\n\n**Existing channels/roles are preserved.**'
    )
    .setFooter({ text: 'Select a template below • Timeout: 60s' });

  const rows = [];
  const templateKeys = Object.keys(TEMPLATES);
  for (let i = 0; i < templateKeys.length; i += 3) {
    const chunk = templateKeys.slice(i, i + 3);
    const row = new ActionRowBuilder().addComponents(
      chunk.map(key => {
        const t = TEMPLATES[key];
        return new ButtonBuilder()
          .setCustomId(`setup_${key}`)
          .setLabel(t.name)
          .setStyle(getButtonStyle(key));
      })
    );
    rows.push(row);
  }

  const cancelRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('setup_cancel')
      .setLabel('❌ Cancel')
      .setStyle(ButtonStyle.Danger)
  );
  rows.push(cancelRow);

  const msg = await interaction.editReply({ embeds: [embed], components: rows });

  const collector = msg.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 60000,
    filter: i => i.user.id === interaction.user.id,
  });

  collector.on('collect', async (i) => {
    if (i.customId === 'setup_cancel') {
      collector.stop();
      await i.update({ embeds: [embeds.info('❌ Cancelled', 'Server setup cancelled.')], components: [] });
      return;
    }
    await i.deferUpdate();
    collector.stop();
    const templateKey = i.customId.replace('setup_', '');
    await runSetup(interaction, TEMPLATES[templateKey], msg);
  });

  collector.on('end', async (collected, reason) => {
    if (reason === 'time') {
      try {
        await interaction.editReply({ components: [] });
      } catch {}
    }
  });
}

function getButtonStyle(key) {
  const styles = {
    community: ButtonStyle.Primary,
    gaming: ButtonStyle.Success,
    development: ButtonStyle.Secondary,
    vps: ButtonStyle.Danger,
    fun: ButtonStyle.Primary,
  };
  return styles[key] || ButtonStyle.Primary;
}

async function runSetup(interaction, template, existingMsg) {
  const deferred = !interaction.deferred && !interaction.replied;
  if (deferred) await interaction.deferReply({ ephemeral: true });

  const guild = interaction.guild;
  const results = { roles: 0, categories: 0, channels: 0, skipped: { roles: 0, categories: 0, channels: 0 } };

  const progressEmbed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle(`${template.emoji || '🏗️'} Setting up: ${template.name}`)
    .setDescription('⏳ Starting setup...')
    .setFooter({ text: 'This may take a moment' });

  const progressMsg = existingMsg
    ? await existingMsg.edit({ embeds: [progressEmbed], components: [] })
    : await interaction.editReply({ embeds: [progressEmbed] });

  let total = 0;
  for (const cat of template.categories) {
    total += cat.channels.length;
  }
  total += template.roles.length;
  let done = 0;

  async function updateProgress(action) {
    done++;
    const pct = Math.round((done / total) * 100);
    const bar = '🟩'.repeat(Math.floor(pct / 10)) + '⬜'.repeat(10 - Math.floor(pct / 10));
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`${template.emoji || '🏗️'} Setting up: ${template.name}`)
      .setDescription(`**Progress:** ${pct}%\n${bar}\n\n${action}`)
      .setFooter({ text: 'Creating channels & roles...' });
    try {
      await progressMsg.edit({ embeds: [embed] });
    } catch {}
  }

  // Create roles
  for (const rdef of template.roles) {
    const existing = guild.roles.cache.find(r => r.name === rdef.name);
    if (!existing) {
      await guild.roles.create({
        name: rdef.name,
        color: rdef.color,
        permissions: rdef.permissions,
        reason: 'Server setup by a2bot',
      });
      results.roles++;
      await updateProgress(`✅ Created role **${rdef.name}**`);
    } else {
      results.skipped.roles++;
      await updateProgress(`⏭️ Role **${rdef.name}** already exists (skipped)`);
    }
  }

  // Create categories and channels
  for (const cat of template.categories) {
    const existingCat = guild.channels.cache.find(
      c => c.type === ChannelType.GuildCategory && c.name === cat.name
    );
    const category = existingCat || await guild.channels.create({
      name: cat.name,
      type: ChannelType.GuildCategory,
      reason: 'Server setup by a2bot',
    });
    if (!existingCat) {
      results.categories++;
      results.skipped.categories++;
    }

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
        await updateProgress(`✅ Created channel **${ch.name}** in **${cat.name}**`);
      } else {
        results.skipped.channels++;
        await updateProgress(`⏭️ Channel **${ch.name}** already exists (skipped)`);
      }
    }
  }

  // Save suggestion channel reference
  const suggChannel = guild.channels.cache.find(c =>
    c.name.includes('suggestions') || c.name.includes('💡')
  );
  if (suggChannel) {
    const data = db.get('guilds', guild.id) || {};
    data.suggestionChannel = suggChannel.id;
    db.set('guilds', guild.id, data);
  }

  const createdRoles = results.roles > 0 ? `✅ **${results.roles}** role(s) created` : '';
  const createdCats = results.categories > 0 ? `✅ **${results.categories}** categor(ies) created` : '';
  const createdChs = results.channels > 0 ? `✅ **${results.channels}** channel(s) created` : '';
  const createdParts = [createdRoles, createdCats, createdChs].filter(Boolean);

  const skippedRoles = results.skipped.roles > 0 ? `⏭️ ${results.skipped.roles} role(s)` : '';
  const skippedCats = results.skipped.categories > 0 ? `⏭️ ${results.skipped.categories} categor(ies)` : '';
  const skippedChs = results.skipped.channels > 0 ? `⏭️ ${results.skipped.channels} channel(s)` : '';
  const skippedParts = [skippedRoles, skippedCats, skippedChs].filter(Boolean);

  const summary = `## ✅ Server Setup Complete!\n\n` +
    `**Template:** ${template.name}\n\n` +
    `### 📦 Created\n${createdParts.map(p => `- ${p}`).join('\n') || '- Nothing new (all existed)'}\n\n` +
    (skippedParts.length ? `### ⏭️ Already Existed\n${skippedParts.map(p => `- ${p}`).join('\n')}\n\n` : '') +
    `### 📋 Quick Tips\n` +
    `- Use \`/improve analyze\` to check server health\n` +
    `- Use \`/roles\` to configure auto-roles\n` +
    `- Use \`/ticket\` to set up a ticket system\n` +
    `- Use \`/level-config\` to enable leveling`;

  logger.info(`Setup ${template.name} done for ${guild.name} (${results.roles}r, ${results.categories}c, ${results.channels}ch, ${results.skipped.roles}s, ${results.skipped.categories}cs, ${results.skipped.channels}chs)`);

  const finalEmbed = new EmbedBuilder()
    .setColor(0x57F287)
    .setTitle(`✅ Server Setup Complete — ${template.name}`)
    .setDescription(summary)
    .setTimestamp();

  await progressMsg.edit({ embeds: [finalEmbed], components: [] });
}
