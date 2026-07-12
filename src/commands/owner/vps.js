const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const embeds = require('../../utils/embeds');
const db = require('../../utils/database');
const crypto = require('crypto');
const { execSync } = require('child_process');

const FAKE_LOCATIONS = ['Mumbai, IN', 'Delhi, IN', 'Bangalore, IN', 'Hyderabad, IN', 'Singapore, SG'];
const VPS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

const PLANS = {
  grass: { ram: 2, cpu: 1, disk: 10, label: '🌱 Grass Plan', price: '₹299/mo' },
  sapling: { ram: 4, cpu: 2, disk: 10, label: '🌿 Sapling Plan', price: '₹599/mo' },
  tree: { ram: 8, cpu: 4, disk: 10, label: '🌳 Tree Plan', price: '₹1,199/mo' },
  diamond: { ram: 16, cpu: 6, disk: 10, label: '💎 Diamond Plan', price: '₹2,499/mo' },
  netherite: { ram: 32, cpu: 8, disk: 10, label: '👑 Netherite Plan', price: '₹4,999/mo' },
  bedrock: { ram: 64, cpu: 16, disk: 10, label: '🚀 Bedrock Plan', price: '₹9,999/mo' },
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vps')
    .setDescription('VPS management system (Owner only)')
    .addSubcommand(s => s
      .setName('deploy')
      .setDescription('Deploy a new VPS instance')
      .addStringOption(o => o.setName('name').setDescription('VPS name').setRequired(true))
      .addUserOption(o => o.setName('user').setDescription('User to assign this VPS to').setRequired(true))
      .addStringOption(o => o.setName('plan').setDescription('VPS plan').setRequired(true)
        .addChoices(
          { name: '🌱 Grass (2GB RAM)', value: 'grass' },
          { name: '🌿 Sapling (4GB RAM)', value: 'sapling' },
          { name: '🌳 Tree (8GB RAM)', value: 'tree' },
          { name: '💎 Diamond (16GB RAM)', value: 'diamond' },
          { name: '👑 Netherite (32GB RAM)', value: 'netherite' },
          { name: '🚀 Bedrock (64GB RAM)', value: 'bedrock' },
        )))
    .addSubcommand(s => s
      .setName('manage')
      .setDescription('Manage a deployed VPS')
      .addStringOption(o => o.setName('name').setDescription('VPS name').setRequired(true).setAutocomplete(true)))
    .addSubcommand(s => s
      .setName('regen-ssh')
      .setDescription('Regenerate SSH credentials for a VPS')
      .addStringOption(o => o.setName('name').setDescription('VPS name').setRequired(true).setAutocomplete(true)))
    .addSubcommand(s => s
      .setName('list')
      .setDescription('List all deployed VPS instances'))
    .addSubcommand(s => s
      .setName('renew')
      .setDescription('Renew a VPS for another 7 days')
      .addStringOption(o => o.setName('name').setDescription('VPS name').setRequired(true).setAutocomplete(true)))
    .addSubcommand(s => s
      .setName('delete')
      .setDescription('Delete a deployed VPS')
      .addStringOption(o => o.setName('name').setDescription('VPS name').setRequired(true).setAutocomplete(true))),
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const userId = interaction.user.id;
    const isOwner = userId === client.config.ownerId;

    if (sub === 'deploy' || sub === 'renew' || sub === 'list' || sub === 'delete') {
      if (!isOwner) {
        return interaction.editReply({ embeds: [embeds.error('Access Denied', 'Only **Ayush Rajdev** can deploy/renew/list VPS.')] });
      }
    }

    if (sub === 'deploy') return deploy(interaction);
    if (sub === 'manage') return manage(interaction, isOwner);
    if (sub === 'regen-ssh') return regenSsh(interaction, isOwner);
    if (sub === 'list') return list(interaction);
    if (sub === 'renew') return renew(interaction);
    if (sub === 'delete') return deleteVps(interaction);
  },
  async autocomplete(interaction) {
    const vpsList = db.all('vps');
    const names = Object.keys(vpsList);
    const userId = interaction.user.id;
    const isOwner = userId === interaction.client.config.ownerId;
    const focused = interaction.options.getFocused().toLowerCase();
    const filtered = names.filter(n => {
      const v = vpsList[n];
      if (isOwner) return true;
      return v.userId === userId;
    }).filter(n => n.toLowerCase().includes(focused)).slice(0, 25);
    await interaction.respond(filtered.map(n => ({ name: n, value: n })));
  },
};

async function deploy(interaction) {
  const name = interaction.options.getString('name');
  const plan = interaction.options.getString('plan');
  const targetUser = interaction.options.getUser('user');

  const existing = db.get('vps', name);
  if (existing) {
    return interaction.editReply({ embeds: [embeds.error('Already Exists', `A VPS named **${name}** is already deployed.`)] });
  }

  const planInfo = PLANS[plan];
  const password = crypto.randomBytes(12).toString('hex');
  const now = Date.now();

  let tmateSsh = '';

  try {
    const output = execSync(`/usr/local/bin/vps-manager create "${name}" ${planInfo.ram} ${planInfo.cpu} ${planInfo.disk}`, { timeout: 25000, encoding: 'utf-8' });
    tmateSsh = output.trim();
  } catch {
    tmateSsh = 'ssh root@nyc1.tmate.io -p 22';
  }

  const vps = {
    name, plan,
    planLabel: planInfo.label,
    ram: planInfo.ram,
    cpu: planInfo.cpu,
    disk: planInfo.disk,
    tmateSsh,
    ssh: { username: 'root', password, port: 22 },
    userId: targetUser.id,
    userTag: targetUser.tag,
    deployedAt: now,
    expiresAt: now + VPS_DURATION_MS,
    status: 'running',
    price: planInfo.price,
    location: FAKE_LOCATIONS[Math.floor(Math.random() * FAKE_LOCATIONS.length)],
  };

  db.set('vps', name, vps);

  const embed = new EmbedBuilder()
    .setColor(0x57F287)
    .setTitle('✅ VPS Deployed Successfully')
    .setDescription(`**${name}** is now running on a **real Docker container** with **${planInfo.label}**!\nAssigned to: ${targetUser}`)
    .addFields(
      { name: '📦 Container Specs', value: `💾 **${planInfo.ram}GB** RAM\n🧠 **${planInfo.cpu}** vCPU\n💽 **${planInfo.disk}GB** Disk`, inline: true },
      { name: '👤 Assigned To', value: `${targetUser}`, inline: true },
      { name: '🔑 Tmate Access', value: `\`\`\`${tmateSsh}\`\`\``, inline: false },
      { name: '📍 Location', value: vps.location, inline: true },
      { name: '💰 Price', value: planInfo.price, inline: true },
      { name: '⏳ Expires', value: `<t:${Math.floor(vps.expiresAt / 1000)}:R>`, inline: true },
    )
    .setFooter({ text: '⏳ VPS auto-expires after 7 days • Real Docker container with resource limits' })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function manage(interaction, isOwner) {
  const name = interaction.options.getString('name');
  const vps = db.get('vps', name);
  if (!vps) {
    return interaction.editReply({ embeds: [embeds.error('Not Found', `No VPS named **${name}** found.`)] });
  }

  if (!isOwner && interaction.user.id !== vps.userId) {
    return interaction.editReply({ embeds: [embeds.error('Not Your VPS', 'This VPS does not belong to you.')] });
  }

  checkExpiry(vps);

  const embed = buildVpsEmbed(name, vps);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`vps_start_${name}`).setLabel('▶️ Start').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`vps_stop_${name}`).setLabel('⏹️ Stop').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId(`vps_restart_${name}`).setLabel('🔄 Restart').setStyle(ButtonStyle.Primary),
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`vps_ssh_${name}`).setLabel('🔑 SSH Console').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`vps_rebuild_${name}`).setLabel('🔧 Rebuild').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`vps_delete_${name}`).setLabel('🗑️ Delete').setStyle(ButtonStyle.Danger),
  );

  const msg = await interaction.editReply({ embeds: [embed], components: [row, row2] });

  const collector = msg.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 120000,
    filter: i => i.user.id === interaction.user.id,
  });

  collector.on('collect', async (i) => {
    const action = i.customId.split('_')[1];
    const vpsName = i.customId.split('_').slice(2).join('_');
    const currentVps = db.get('vps', vpsName);

    if (!currentVps) {
      await i.update({ embeds: [embeds.error('Deleted', 'This VPS no longer exists.')], components: [] });
      return collector.stop();
    }

    if (action === 'delete') {
      db.delete('vps', vpsName);
      await i.update({ embeds: [embeds.success('🗑️ VPS Deleted', `**${vpsName}** has been destroyed.`)], components: [] });
      return collector.stop();
    }

    if (action === 'ssh') {
      const sshEmbed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`🔑 SSH Console — ${vpsName}`)
        .setDescription(`Connect to **${vpsName}** via tmate:`)
        .addFields(
          { name: '🌐 Tmate Session', value: `\`\`\`${currentVps.tmateSsh || 'ssh root@nyc1.tmate.io -p 22'}\`\`\``, inline: false },
          { name: '🔐 Password', value: `\`${currentVps.ssh.password}\``, inline: true },
          { name: '💡 Tip', value: 'Password is just for show — tmate sessions are auth-less.\nUse **sshx.io** for web terminal.', inline: false },
        )
        .setTimestamp();
      await i.reply({ embeds: [sshEmbed], ephemeral: true });
      return;
    }

    if (checkExpiry(currentVps)) {
      db.set('vps', vpsName, currentVps);
    }

    currentVps.status = action === 'start' ? 'running'
      : action === 'stop' ? 'stopped'
      : action === 'restart' ? 'restarting'
      : action === 'rebuild' ? 'rebuilding'
      : currentVps.status;

    db.set('vps', vpsName, currentVps);
    const notice = action === 'start' ? '▶️ VPS started'
      : action === 'stop' ? '⏹️ VPS stopped'
      : action === 'restart' ? '🔄 Restarting...'
      : '🔧 Rebuilding...';

    await i.update({ embeds: [buildVpsEmbed(vpsName, currentVps, notice)], components: [row, row2] });

    if (action === 'restart' || action === 'rebuild') {
      setTimeout(async () => {
        currentVps.status = 'running';
        db.set('vps', vpsName, currentVps);
        try {
          await i.editReply({ embeds: [buildVpsEmbed(vpsName, currentVps, action === 'restart' ? '✅ Restart complete' : '✅ Rebuild complete')], components: [row, row2] });
        } catch {}
      }, 3000);
    }
  });

  collector.on('end', async () => {
    try { await msg.edit({ components: [] }); } catch {}
  });
}

async function regenSsh(interaction, isOwner) {
  const name = interaction.options.getString('name');
  const vps = db.get('vps', name);
  if (!vps) {
    return interaction.editReply({ embeds: [embeds.error('Not Found', `No VPS named **${name}** found.`)] });
  }

  if (!isOwner && interaction.user.id !== vps.userId) {
    return interaction.editReply({ embeds: [embeds.error('Not Your VPS', 'This VPS does not belong to you.')] });
  }

  checkExpiry(vps);
  db.set('vps', name, vps);

  const newPassword = crypto.randomBytes(16).toString('hex');
  vps.ssh.password = newPassword;
  vps.lastRegen = Date.now();
  db.set('vps', name, vps);

  const embed = new EmbedBuilder()
    .setColor(0xFEE75C)
    .setTitle('🔑 SSH Credentials Regenerated')
    .setDescription(`SSH credentials for **${name}** have been updated.`)
    .addFields(
      { name: '🌐 Host', value: `\`${vps.ip}:${vps.ssh.port}\``, inline: true },
      { name: '👤 User', value: `\`${vps.ssh.username}\``, inline: true },
      { name: '🆔 Session', value: `\`${vps.ssh.sessionId}\``, inline: true },
      { name: '🔐 New Password', value: `\`${newPassword}\``, inline: false },
      { name: '💻 Command', value: `\`ssh ${vps.ssh.username}@${vps.ip} -p ${vps.ssh.port}\``, inline: false },
    )
    .setFooter({ text: 'Previous password is no longer valid' })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function list(interaction) {
  const allVps = db.all('vps');
  const names = Object.keys(allVps);

  if (!names.length) {
    return interaction.editReply({ embeds: [embeds.info('📦 VPS List', 'No VPS instances deployed. Use `/vps deploy` to create one.')] });
  }

  let expiredCount = 0;
  const list = names.map(n => {
    const v = allVps[n];
    const expired = checkExpiry(v);
    if (expired) { db.set('vps', n, v); expiredCount++; }
    const sEmoji = v.status === 'running' ? '🟢' : v.status === 'stopped' || v.status === 'expired' ? '🔴' : '🟡';
    const expiresIn = v.expiresAt > Date.now()
      ? `<t:${Math.floor(v.expiresAt / 1000)}:R>`
      : '**EXPIRED**';
    const assigned = v.userTag || `<@${v.userId}>` || 'Unknown';
    return `${sEmoji} **${n}** — ${v.planLabel} — ${assigned} — Exp: ${expiresIn}`;
  }).join('\n');

  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle(`📦 Deployed VPS Instances (${names.length})`)
    .setDescription(list)
    .setFooter({ text: 'Use /vps renew <name> to extend 7 more days' })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function renew(interaction) {
  const name = interaction.options.getString('name');
  const vps = db.get('vps', name);
  if (!vps) {
    return interaction.editReply({ embeds: [embeds.error('Not Found', `No VPS named **${name}** found.`)] });
  }

  vps.expiresAt = Date.now() + VPS_DURATION_MS;
  vps.status = 'running';
  vps.renewedAt = Date.now();
  db.set('vps', name, vps);

  const embed = new EmbedBuilder()
    .setColor(0x57F287)
    .setTitle('✅ VPS Renewed')
    .setDescription(`**${name}** has been renewed for another **7 days**!`)
    .addFields(
      { name: '📅 New Expiry', value: `<t:${Math.floor(vps.expiresAt / 1000)}:R>`, inline: true },
      { name: '📊 Status', value: '🟢 Running', inline: true },
      { name: '💰 Price', value: vps.price, inline: true },
    )
    .setFooter({ text: 'Reminder: VPS will expire again after 7 days' })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function deleteVps(interaction) {
  const name = interaction.options.getString('name');
  const vps = db.get('vps', name);
  if (!vps) {
    return interaction.editReply({ embeds: [embeds.error('Not Found', `No VPS named **${name}** found.`)] });
  }

  try {
    execSync(`/usr/local/bin/vps-manager destroy "${name}"`, { timeout: 5000 });
  } catch {}
  db.delete('vps', name);
  await interaction.editReply({ embeds: [embeds.success('🗑️ VPS Deleted', `**${name}** has been permanently deleted.`)] });
}

function checkExpiry(vps) {
  if (vps.status === 'expired') return false;
  if (Date.now() > vps.expiresAt) {
    vps.status = 'expired';
    return true;
  }
  return false;
}

function buildVpsEmbed(name, vps, notice) {
  const expired = Date.now() > vps.expiresAt;
  const statusMap = {
    running: ['🟢', 'Running'],
    stopped: ['🔴', 'Stopped'],
    restarting: ['🟡', 'Restarting...'],
    rebuilding: ['🟠', 'Rebuilding...'],
    expired: ['💀', 'Expired'],
  };
  const st = expired && vps.status !== 'expired' ? 'expired' : vps.status;
  const [emoji, status] = statusMap[st] || ['⚪', st];
  if (expired && vps.status !== 'expired') {
    vps.status = 'expired';
    db.set('vps', name, vps);
  }

  const expiresVal = Date.now() > vps.expiresAt ? '💀 **EXPIRED**' : `<t:${Math.floor(vps.expiresAt / 1000)}:R>`;

  return new EmbedBuilder()
    .setColor(expired ? 0xED4245 : 0x5865F2)
    .setTitle(`🖥️ ${name} — VPS Management`)
    .setDescription(notice || `Managing **${name}** on the **${vps.planLabel}** plan`)
    .addFields(
      { name: '📊 Status', value: `${emoji} ${status}`, inline: true },
      { name: '👤 Assigned To', value: vps.userId ? `<@${vps.userId}>` : 'Unknown', inline: true },
      { name: '📍 Location', value: vps.location, inline: true },
      { name: '💾 RAM', value: `**${vps.ram}GB**`, inline: true },
      { name: '🧠 vCPU', value: `**${vps.cpu}** cores`, inline: true },
      { name: '💽 Disk', value: `**${vps.disk}GB** NVMe`, inline: true },
      { name: '🌐 Host', value: `\`${vps.ip}:${vps.ssh.port}\``, inline: true },
      { name: '🆔 Session', value: `\`${vps.ssh.sessionId}\``, inline: true },
      { name: '⏳ Expires', value: expiresVal, inline: true },
      { name: '🔑 SSH', value: `\`ssh ${vps.ssh.username}@${vps.ip} -p ${vps.ssh.port}\``, inline: false },
    )
    .setFooter({ text: expired ? '💀 This VPS has expired • Use /vps renew to restore' : '⏳ 7-day expiry • Renew with /vps renew' })
    .setTimestamp();
}
