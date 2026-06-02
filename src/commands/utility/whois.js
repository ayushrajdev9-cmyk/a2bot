const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('whois')
    .setDescription('Show detailed user information')
    .addUserOption(o => o.setName('user').setDescription('Target user')),
  async execute(interaction) {
    const member = interaction.options.getMember('user') || interaction.member;
    const user = member.user;

    const roles = member.roles.cache.filter(r => r.id !== interaction.guild.id).sort((a, b) => b.position - a.position).map(r => r.toString()).join(', ') || 'None';

    const perms = member.permissions.toArray().map(p => p.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())).join(', ') || 'None';

    const embed = embeds.info(user.tag)
      .setThumbnail(user.displayAvatarURL({ size: 512 }))
      .addFields(
        { name: 'ID', value: user.id, inline: true },
        { name: 'Nickname', value: member.nickname || 'None', inline: true },
        { name: 'Bot', value: user.bot ? 'Yes' : 'No', inline: true },
        { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
        { name: 'Joined Discord', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Roles', value: roles.length > 1024 ? `${roles.slice(0, 1020)}...` : roles },
        { name: 'Key Permissions', value: perms.length > 1024 ? `${perms.slice(0, 1020)}...` : perms },
      );

    if (user.bannerURL()) embed.setImage(user.bannerURL({ size: 1024 }));

    await interaction.reply({ embeds: [embed] });
  },
};
