const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const config = require('../../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Get bot invite links'),
  async execute(interaction) {
    const invite = `https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot%20applications.commands`;
    const embed = embeds.info('Invite Links')
      .addFields(
        { name: 'Invite Bot', value: `[Click Here](${invite})` },
        { name: 'Support Server', value: '[Join Support](https://discord.gg/your-server)' },
        { name: 'Website', value: '[Visit Website](https://example.com)' },
      );

    await interaction.reply({ embeds: [embed] });
  },
};
