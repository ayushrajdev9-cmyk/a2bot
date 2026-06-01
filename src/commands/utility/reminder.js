const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reminder')
    .setDescription('Set a reminder')
    .addIntegerOption(o => o.setName('minutes').setDescription('Minutes from now').setRequired(true).setMinValue(1).setMaxValue(1440))
    .addStringOption(o => o.setName('message').setDescription('What to remind you about').setRequired(true)),
  async execute(interaction) {
    const minutes = interaction.options.getInteger('minutes');
    const message = interaction.options.getString('message');
    const ms = minutes * 60 * 1000;

    await interaction.reply({ embeds: [embeds.success('Reminder Set', `I'll remind you in ${minutes} minute(s): ${message}`)] });

    setTimeout(async () => {
      try {
        const user = await interaction.client.users.fetch(interaction.user.id);
        await user.send({ embeds: [embeds.info('Reminder', message)] });
      } catch {
        logger.warn(`Could not DM reminder to ${interaction.user.tag}`);
      }
    }, ms);
  },
};
