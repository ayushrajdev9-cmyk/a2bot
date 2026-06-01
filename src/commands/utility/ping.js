const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot latency'),
  async execute(interaction) {
    const sent = await interaction.reply({ embeds: [embeds.info('Pinging...')], fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply({ embeds: [embeds.info('Pong!', `Bot: ${latency}ms\nAPI: ${Math.round(interaction.client.ws.ping)}ms`)] });
  },
};
