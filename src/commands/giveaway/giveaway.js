const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Create a giveaway')
    .addChannelOption(o => o.setName('channel').setDescription('Channel to host the giveaway in').setRequired(true))
    .addIntegerOption(o => o.setName('duration_minutes').setDescription('Duration in minutes').setRequired(true).setMinValue(1))
    .addStringOption(o => o.setName('prize').setDescription('The prize to win').setRequired(true))
    .addIntegerOption(o => o.setName('winners').setDescription('Number of winners').setMinValue(1).setMaxValue(10)),
  async execute(interaction) {
    await interaction.deferReply();

    const channel = interaction.options.getChannel('channel');
    const duration = interaction.options.getInteger('duration_minutes');
    const prize = interaction.options.getString('prize');
    const winners = interaction.options.getInteger('winners') || 1;

    if (!channel.isTextBased()) {
      return interaction.editReply({ embeds: [embeds.error('Error', 'Please select a text channel.')] });
    }

    const endTime = Math.floor((Date.now() + duration * 60 * 1000) / 1000);

    const embed = embeds.info('🎉 Giveaway 🎉', `**Prize:** ${prize}\n**Winners:** ${winners}\n**Ends:** <t:${endTime}:R>\n\nReact with 🎉 to enter!`)
      .setFooter({ text: `Ends at` })
      .setTimestamp(endTime * 1000);

    const msg = await channel.send({ embeds: [embed] });
    await msg.react('🎉');

    const giveawayData = {
      channelId: channel.id,
      messageId: msg.id,
      prize,
      winners,
      endTime,
      hosterId: interaction.user.id,
      guildId: interaction.guild.id,
    };

    db.push('giveaways', 'active', giveawayData);

    setTimeout(async () => {
      try {
        const fetched = await channel.messages.fetch(msg.id);
        const reaction = fetched.reactions.cache.get('🎉');
        if (!reaction) return;

        const users = await reaction.users.fetch();
        const entries = users.filter(u => !u.bot).map(u => u);

        if (entries.length < winners) {
          await channel.send({ embeds: [embeds.warning('Giveaway Ended', `Not enough participants for **${prize}**.`)], reply: { messageReference: msg.id } });
          return;
        }

        const picked = [];
        for (let i = 0; i < winners; i++) {
          if (!entries.length) break;
          const idx = Math.floor(Math.random() * entries.length);
          picked.push(entries.splice(idx, 1)[0]);
        }

        const winnersList = picked.map(u => u.toString()).join(', ');
        await channel.send({ embeds: [embeds.success('🎉 Giveaway Winner!', `Congratulations ${winnersList}! You won **${prize}**!`)] });

        const active = db.get('giveaways', 'active') || [];
        const filtered = active.filter(g => g.messageId !== msg.id);
        db.set('giveaways', 'ended', [...(db.get('giveaways', 'ended') || []), giveawayData]);
        db.set('giveaways', 'active', filtered);
      } catch (err) {
        logger.error('Giveaway error:', err);
      }
    }, duration * 60 * 1000);

    await interaction.editReply({ embeds: [embeds.success('Giveaway Created', `Giveaway for **${prize}** started in ${channel}!`)], ephemeral: true });
  },
};
