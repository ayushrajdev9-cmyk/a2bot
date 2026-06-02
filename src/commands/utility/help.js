const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const path = require('path');
const fs = require('fs');

const categoryEmojis = {
  ai: '🤖', fun: '🎮', moderation: '🛡️', music: '🎵', server: '⚙️', utility: '🔧',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show command list or info about a specific command')
    .addStringOption(o => o.setName('command').setDescription('Command name for details')),
  async execute(interaction, client) {
    const c = client || interaction.client;
    const commandName = interaction.options.getString('command');

    if (commandName) {
      const cmd = c.commands.get(commandName);
      if (!cmd) return interaction.reply({ embeds: [embeds.error('Not Found', `Command \`${commandName}\` does not exist.`)], ephemeral: true });
      const embed = embeds.info(`/${cmd.data.name}`)
        .setDescription(cmd.data.description)
        .addFields({ name: 'Category', value: getCategory(cmd.data.name, c), inline: true });
      if (cmd.data.options?.length) {
        embed.addFields({ name: 'Options', value: cmd.data.options.map(o => `\`${o.name}\` - ${o.description}`).join('\n') });
      }
      return interaction.reply({ embeds: [embed] });
    }

    const commandsDir = path.join(__dirname, '..');
    const categories = fs.readdirSync(commandsDir).filter(f => fs.statSync(path.join(commandsDir, f)).isDirectory());

    const embed = new EmbedBuilder()
      .setTitle('Command List')
      .setColor(0x5865F2)
      .setTimestamp();

    for (const cat of categories) {
      const catPath = path.join(commandsDir, cat);
      const files = fs.readdirSync(catPath).filter(f => f.endsWith('.js'));
      const cmds = files.map(f => `\`${f.replace('.js', '')}\``).join(', ');
      if (cmds) embed.addFields({ name: `${categoryEmojis[cat] || '📁'} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`, value: cmds });
    }

    await interaction.reply({ embeds: [embed] });
  },
};

function getCategory(cmdName, client) {
  const commandsDir = path.join(__dirname, '..');
  const categories = fs.readdirSync(commandsDir).filter(f => fs.statSync(path.join(commandsDir, f)).isDirectory());
  for (const cat of categories) {
    const files = fs.readdirSync(path.join(commandsDir, cat));
    if (files.includes(`${cmdName}.js`)) return cat;
  }
  return 'Unknown';
}
