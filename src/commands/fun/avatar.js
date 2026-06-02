const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Get a user\'s avatar')
    .addUserOption(o => o.setName('user').setDescription('User to get avatar of'))
    .addStringOption(o => o.setName('format').setDescription('Image format').addChoices(
      { name: 'WebP', value: 'webp' },
      { name: 'PNG', value: 'png' },
      { name: 'JPG', value: 'jpg' },
      { name: 'GIF', value: 'gif' },
    )),
  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const format = interaction.options.getString('format') || 'png';
    const avatar = user.displayAvatarURL({ size: 4096, extension: format });
    const embed = embeds.info(`${user.tag}'s Avatar`).setImage(avatar);
    await interaction.reply({ embeds: [embed] });
  },
};
