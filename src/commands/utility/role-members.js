const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role-members')
    .setDescription('Show members with a specific role')
    .addRoleOption(o => o.setName('role').setDescription('Target role').setRequired(true)),
  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const members = role.members.map(m => m.user.tag);
    const count = members.length;

    if (!count) {
      return interaction.reply({ embeds: [embeds.warning(role.name, 'No members have this role.')] });
    }

    const list = members.join('\n');
    const desc = list.length > 4000 ? `${list.slice(0, 3997)}...` : list;

    await interaction.reply({ embeds: [embeds.info(role.name, `**${count} member(s)**\n${desc}`)] });
  },
};
