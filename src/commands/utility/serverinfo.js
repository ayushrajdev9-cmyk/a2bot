const { SlashCommandBuilder, GuildVerificationLevel } = require('discord.js');
const embeds = require('../../utils/embeds');

const verifLevels = {
  [GuildVerificationLevel.None]: 'None',
  [GuildVerificationLevel.Low]: 'Low',
  [GuildVerificationLevel.Medium]: 'Medium',
  [GuildVerificationLevel.High]: 'High',
  [GuildVerificationLevel.VeryHigh]: 'Very High',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Show detailed server information'),
  async execute(interaction) {
    const guild = interaction.guild;

    const embed = embeds.info(guild.name)
      .setThumbnail(guild.iconURL({ size: 512 }))
      .addFields(
        { name: 'ID', value: guild.id, inline: true },
        { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
        { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Members', value: `${guild.memberCount}`, inline: true },
        { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true },
        { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
        { name: 'Boosts', value: `${guild.premiumSubscriptionCount || 0} (Level ${guild.premiumTier})`, inline: true },
        { name: 'Verification', value: verifLevels[guild.verificationLevel] || 'Unknown', inline: true },
      );

    if (guild.bannerURL()) embed.setImage(guild.bannerURL({ size: 1024 }));
    if (guild.description) embed.setDescription(guild.description);

    await interaction.reply({ embeds: [embed] });
  },
};
