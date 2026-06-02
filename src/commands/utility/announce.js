const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Send an announcement embed to a channel')
    .addStringOption(o => o.setName('message').setDescription('Announcement message').setRequired(true))
    .addChannelOption(o => o.setName('channel').setDescription('Target channel (default current)'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const message = interaction.options.getString('message');
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    const embed = embeds.info('📢 Announcement', message)
      .setFooter({ text: `Announced by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

    await channel.send({ embeds: [embed] });
    await interaction.reply({ embeds: [embeds.success('Announcement Sent', `Announcement sent to ${channel}`)], ephemeral: true });
  },
};
