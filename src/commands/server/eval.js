const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('[Owner only] Execute arbitrary code')
    .addStringOption(o => o.setName('code').setDescription('Code to evaluate').setRequired(true)),
  async execute(interaction, client) {
    if (interaction.user.id !== client.config.ownerId) {
      return interaction.reply({ embeds: [embeds.error('Access Denied', 'Only the bot owner can use this command.')], ephemeral: true });
    }

    const code = interaction.options.getString('code');

    try {
      const result = await eval(`(async () => { ${code} })()`);
      const output = String(result);
      await interaction.reply({
        embeds: [embeds.info('Eval Result', `\`\`\`js\n${output.slice(0, 1990)}\n\`\`\``)],
        ephemeral: true,
      });
    } catch (err) {
      await interaction.reply({
        embeds: [embeds.error('Eval Error', `\`\`\`js\n${err.toString().slice(0, 1990)}\n\`\`\``)],
        ephemeral: true,
      });
    }
  },
};
