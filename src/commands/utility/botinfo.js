const { SlashCommandBuilder, EmbedBuilder, version } = require('discord.js');
const embeds = require('../../utils/embeds');
const config = require('../../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Show bot statistics'),
  async execute(interaction, client) {
    const c = client || interaction.client;
    const uptime = Math.floor(c.uptime / 1000);
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;
    const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const embed = embeds.info(`${c.user.username} Stats`)
      .addFields(
        { name: 'Servers', value: `${c.guilds.cache.size}`, inline: true },
        { name: 'Users', value: `${c.users.cache.size}`, inline: true },
        { name: 'Channels', value: `${c.channels.cache.size}`, inline: true },
        { name: 'Ping', value: `${Math.round(c.ws.ping)}ms`, inline: true },
        { name: 'Uptime', value: uptimeStr, inline: true },
        { name: 'Discord.js', value: `v${version}`, inline: true },
        { name: 'Node.js', value: process.version, inline: true },
        { name: 'Owner', value: config.ownerName, inline: true },
      )
      .setThumbnail(c.user.displayAvatarURL());

    await interaction.reply({ embeds: [embed] });
  },
};
