const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const embeds = require('../../utils/embeds');
const db = require('../../utils/database');
const crypto = require('crypto');

const FAKE_IPS = ['45.33.32.156', '104.237.142.243', '192.53.115.67', '172.105.90.187', '66.228.42.89'];
const FAKE_LOCATIONS = ['US East', 'US West', 'EU West', 'EU Central', 'Asia SG'];

const PLANS = {
  enterprise: { ram: 1200, cpu: 256, disk: 50, label: '🪐 Enterprise-X', price: '$299.99/mo' },
  ultra: { ram: 800, cpu: 128, disk: 40, label: '🚀 Ultra-Pro', price: '$199.99/mo' },
  mega: { ram: 400, cpu: 64, disk: 30, label: '💪 Mega', price: '$99.99/mo' },
  boost: { ram: 200, cpu: 32, disk: 20, label: '⚡ Boost', price: '$49.99/mo' },
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vps')
    .setDescription('VPS management system (Owner only)')
    .addSubcommand(s => s
      .setName('deploy')
      .setDescription('Deploy a new VPS instance')
      .addStringOption(o => o.setName('name').setDescription('VPS name').setRequired(true))
      .addStringOption(o => o.setName('plan').setDescription('VPS plan').setRequired(true)
        .addChoices(
          { name: '🪐 Enterprise-X (1200GB RAM)', value: 'enterprise' },
          { name: '🚀 Ultra-Pro (800GB RAM)', value: 'ultra' },
          { name: '💪 Mega (400GB RAM)', value: 'mega' },
          { name: '⚡ Boost (200GB RAM)', value: 'boost' },
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
      .setDescription('List all deployed VPS instances')),
  async execute(interaction, client) {
    if (interaction.user.id !== client.config.ownerId) {
      return interaction.reply({ embeds: [embeds.error('Access Denied', 'Only **Ayush Rajdev** can use VPS commands.')], ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();

    if (sub === 'deploy') return deploy(interaction);
    if (sub === 'manage') return manage(interaction);
    if (sub === 'regen-ssh') return regenSsh(interaction);
    if (sub === 'list') return list(interaction);
  },
  async autocomplete(interaction) {
    const vpsList = db.all('vps');
    const names = Object.keys(vpsList);
    const focused = interaction.options.getFocused().toLowerCase();
    const filtered = names.filter(n => n.toLowerCase().includes(focused)).slice(0, 25);
    await interaction.respond(filtered.map(n => ({ name: n, value: n })));
  },
};

async function deploy(interaction) {
  const name = interaction.options.getString('name');
  const plan = interaction.options.getString('plan');

  const existing = db.get('vps', name);
  if (existing) {
    return interaction.reply({ embeds: [embeds.error('Already Exists', `A VPS named **${name}** is already deployed.`)], ephemeral: true });
  }

  const planInfo = PLANS[plan];
  const ip = FAKE_IPS[Math.floor(Math.random() * FAKE_IPS.length)];
  const username = 'root';
  const password = crypto.randomBytes(12).toString('hex');
  const port = 22;

  const vps = {
    name,
    plan,
    planLabel: planInfo.label,
    advertisedRam: planInfo.ram,
    actualRam: 1,
    cpu: planInfo.cpu,
    disk: planInfo.disk,
    ip,
    ssh: { username, password, port },
    deployedAt: Date.now(),
    status: 'running',
    price: planInfo.price,
    location: FAKE_LOCATIONS[Math.floor(Math.random() * FAKE_LOCATIONS.length)],
  };

  db.set('vps', name, vps);

  const embed = new EmbedBuilder()
    .setColor(0x57F287)
    .setTitle('✅ VPS Deployed Successfully')
    .setDescription(`**${name}** is now running on the **${planInfo.label}** plan!`)
    .addFields(
      { name: '📋 Advertised Specs', value: `🟢 **${planInfo.ram}GB** RAM\n🟢 **${planInfo.cpu}** vCPU\n🟢 **${planInfo.disk}GB** NVMe SSD`, inline: true },
      { name: '📋 Actual Specs', value: `🔴 **${vps.actualRam}GB** RAM\n🟢 **${planInfo.cpu}** vCPU\n🟢 **${planInfo.disk}GB** NVMe SSD`, inline: true },
      { name: '🌐 Connection', value: `IP: \`${ip}:${port}\`\nUser: \`${username}\`\nPass: \`${password}\``, inline: false },
      { name: '📍 Location', value: vps.location, inline: true },
      { name: '💰 Price', value: planInfo.price, inline: true },
      { name: '🔑 SSH', value: `\`ssh ${username}@${ip} -p ${port}\``, inline: false },
    )
    .setFooter({ text: '⚡ Only 1GB RAM is actually allocated • Advertised specs are for show' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function manage(interaction) {
  const name = interaction.options.getString('name');
  const vps = db.get('vps', name);
  if (!vps) {
    return interaction.reply({ embeds: [embeds.error('Not Found', `No VPS named **${name}** found.`)], ephemeral: true });
  }

  const embed = buildVpsEmbed(name, vps);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`vps_start_${name}`).setLabel('▶️ Start').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`vps_stop_${name}`).setLabel('⏹️ Stop').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId(`vps_restart_${name}`).setLabel('🔄 Restart').setStyle(ButtonStyle.Primary),
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`vps_rebuild_${name}`).setLabel('🔧 Rebuild').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`vps_delete_${name}`).setLabel('🗑️ Delete').setStyle(ButtonStyle.Danger),
  );

  const msg = await interaction.reply({ embeds: [embed], components: [row, row2] });

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

async function regenSsh(interaction) {
  const name = interaction.options.getString('name');
  const vps = db.get('vps', name);
  if (!vps) {
    return interaction.reply({ embeds: [embeds.error('Not Found', `No VPS named **${name}** found.`)], ephemeral: true });
  }

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
      { name: '🔐 New Password', value: `\`${newPassword}\``, inline: false },
      { name: '💻 Command', value: `\`ssh ${vps.ssh.username}@${vps.ip} -p ${vps.ssh.port}\``, inline: false },
    )
    .setFooter({ text: 'Previous password is no longer valid' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function list(interaction) {
  const allVps = db.all('vps');
  const names = Object.keys(allVps);

  if (!names.length) {
    return interaction.reply({ embeds: [embeds.info('📦 VPS List', 'No VPS instances deployed. Use `/vps deploy` to create one.')] });
  }

  const list = names.map(n => {
    const v = allVps[n];
    const statusEmoji = v.status === 'running' ? '🟢' : v.status === 'stopped' ? '🔴' : '🟡';
    return `${statusEmoji} **${n}** — ${v.planLabel} — ${v.ip} — ${v.location}`;
  }).join('\n');

  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle(`📦 Deployed VPS Instances (${names.length})`)
    .setDescription(list)
    .setFooter({ text: 'Use /vps manage <name> for controls' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

function buildVpsEmbed(name, vps, notice) {
  const statusMap = { running: ['🟢', 'Running'], stopped: ['🔴', 'Stopped'], restarting: ['🟡', 'Restarting...'], rebuilding: ['🟠', 'Rebuilding...'] };
  const [emoji, status] = statusMap[vps.status] || ['⚪', vps.status];

  return new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle(`🖥️ ${name} — VPS Management`)
    .setDescription(notice || `Managing **${name}** on the **${vps.planLabel}** plan`)
    .addFields(
      { name: '📊 Status', value: `${emoji} ${status}`, inline: true },
      { name: '📍 Location', value: vps.location, inline: true },
      { name: '💰 Price', value: vps.price, inline: true },
      { name: '💾 Advertised RAM', value: `🟢 **${vps.advertisedRam}GB**`, inline: true },
      { name: '💾 Actual RAM', value: `🔴 **${vps.actualRam}GB**`, inline: true },
      { name: '🧠 vCPU', value: `**${vps.cpu}** cores`, inline: true },
      { name: '💽 Disk', value: `**${vps.disk}GB** NVMe`, inline: true },
      { name: '🌐 IP', value: `\`${vps.ip}:${vps.ssh.port}\``, inline: true },
      { name: '📅 Deployed', value: `<t:${Math.floor((vps.deployedAt || Date.now()) / 1000)}:R>`, inline: true },
      { name: '🔑 SSH', value: `\`ssh ${vps.ssh.username}@${vps.ip} -p ${vps.ssh.port}\``, inline: false },
    )
    .setFooter({ text: '⚡ Actual RAM is 1GB • Advertised specs are for show' })
    .setTimestamp();
}
