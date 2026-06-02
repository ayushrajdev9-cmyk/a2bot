const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wave')
    .setDescription('Wave at someone')
    .addUserOption(o => o.setName('user').setDescription('User to wave at').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    if (user.id === interaction.user.id) {
      return interaction.reply({ embeds: [embeds.warning('Alone?', "You can't wave at yourself!")], ephemeral: true });
    }
    await interaction.deferReply();
    try {
      const res = await fetch('https://nekos.best/api/v2/wave').then(r => r.json());
      const embed = embeds.info(`👋 ${interaction.user.username} waves at ${user.username}!`).setImage(res.results[0].url);
      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply({ embeds: [embeds.error('Error', 'Failed to fetch reaction.')] });
    }
  },
};
