const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Get bot invite links'),
  async execute(interaction) {
    const invite = `https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot%20applications.commands`;
    const embed = embeds.info('Invite Links')
      .addFields(
        { name: 'Invite Bot', value: `[Click Here](${invite})` },
        { name: 'Website', value: '[a2bot.ayushanzar.qzz.io](https://a2bot.ayushanzar.qzz.io)' },
      );

    await interaction.reply({ embeds: [embed] });
  },
};
