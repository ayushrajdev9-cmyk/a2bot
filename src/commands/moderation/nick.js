const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nick')
    .setDescription('Change a member\'s nickname')
    .addUserOption(o => o.setName('user').setDescription('Member to rename').setRequired(true))
    .addStringOption(o => o.setName('nickname').setDescription('New nickname').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),
  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const nickname = interaction.options.getString('nickname');

    if (!target) {
      return interaction.reply({ embeds: [embeds.error('Error', 'That user is not in this server.')], ephemeral: true });
    }
    if (!target.moderatable) {
      return interaction.reply({ embeds: [embeds.error('Error', 'I cannot change that member\'s nickname.')], ephemeral: true });
    }

    const oldNick = target.nickname || target.user.username;
    await target.setNickname(nickname);
    logger.info(`${interaction.user.tag} changed nickname of ${target.user.tag} from "${oldNick}" to "${nickname}"`);
    await interaction.reply({ embeds: [embeds.success('Nickname Changed', `${target.user.tag}'s nickname has been changed to "${nickname}".`)] });
  },
};
