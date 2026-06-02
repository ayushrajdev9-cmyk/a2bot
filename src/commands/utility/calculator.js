const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('calculator')
    .setDescription('Evaluate a math expression')
    .addStringOption(o => o.setName('expression').setDescription('Math expression (e.g. 2+2*3)').setRequired(true)),
  async execute(interaction) {
    const expr = interaction.options.getString('expression');
    const sanitized = expr.replace(/\s/g, '');

    if (!/^[\d+\-*/().]+$/.test(sanitized)) {
      return interaction.reply({ embeds: [embeds.error('Invalid Expression', 'Only digits, +, -, *, /, (, ), and . are allowed.')], ephemeral: true });
    }

    try {
      const result = Function(`return (${sanitized})`)();
      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error('Invalid result');
      }
      await interaction.reply({ embeds: [embeds.info('Calculator', `\`\`\`\n${expr} = ${result}\n\`\`\``)] });
    } catch {
      await interaction.reply({ embeds: [embeds.error('Calculation Error', 'Could not evaluate the expression.')], ephemeral: true });
    }
  },
};
