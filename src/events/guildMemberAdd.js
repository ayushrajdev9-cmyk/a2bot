const { EmbedBuilder } = require('discord.js');
const db = require('../utils/database');
const config = require('../../config');

module.exports = {
  async execute(member) {
    // Auto-role
    const guildData = db.get('guilds', member.guild.id);
    if (guildData?.autoRole) {
      const role = member.guild.roles.cache.get(guildData.autoRole);
      if (role) await member.roles.add(role).catch(() => {});
    }

    // Welcome message
    if (guildData?.welcomeChannel) {
      const channel = member.guild.channels.cache.get(guildData.welcomeChannel);
      if (channel) {
        const embed = new EmbedBuilder()
          .setTitle(`Welcome ${member.user.username}!`)
          .setDescription(`Welcome to **${member.guild.name}**! You are member #${member.guild.memberCount}.`)
          .setColor(config.colors.success)
          .setThumbnail(member.user.displayAvatarURL())
          .setTimestamp();
        channel.send({ embeds: [embed], content: `${member.user}` });
      }
    }
  },
};
