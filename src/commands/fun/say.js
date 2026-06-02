const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Make the bot repeat a message')
    .addStringOption(o => o.setName('message').setDescription('Message to repeat').setRequired(true)),
  async execute(interaction) {
    const message = interaction.options.getString('message');
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({
        embeds: [embeds.error('Missing Permissions', 'I need `Manage Messages` permission to use this command.')],
        ephemeral: true,
      });
    }
    await interaction.reply({ embeds: [embeds.info('🗣️ Say', message)] });
    try {
      await interaction.deleteReply();
    } catch {
      // ignore if reply can't be deleted
    }
    const channel = interaction.channel;
    await channel.send(message);
  },
};
