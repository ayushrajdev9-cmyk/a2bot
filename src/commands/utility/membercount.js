const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('membercount')
    .setDescription('Show member statistics'),
  async execute(interaction) {
    const guild = interaction.guild;
    await guild.members.fetch();

    const total = guild.memberCount;
    const bots = guild.members.cache.filter(m => m.user.bot).size;
    const humans = total - bots;
    const online = guild.members.cache.filter(m => m.presence?.status === 'online' || m.presence?.status === 'dnd' || m.presence?.status === 'idle').size;
    const voice = guild.members.cache.filter(m => m.voice.channelId).size;

    const embed = embeds.info(`${guild.name} Members`)
      .addFields(
        { name: 'Total', value: `${total}`, inline: true },
        { name: 'Humans', value: `${humans}`, inline: true },
        { name: 'Bots', value: `${bots}`, inline: true },
        { name: 'Online', value: `${online}`, inline: true },
        { name: 'In Voice', value: `${voice}`, inline: true },
      );

    await interaction.reply({ embeds: [embed] });
  },
};
