const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const embeds = require('../../utils/embeds');

const questions = [
  { q: 'What is the capital of France?', a: 'Paris', opts: ['London', 'Paris', 'Berlin', 'Madrid'] },
  { q: 'Which planet is known as the Red Planet?', a: 'Mars', opts: ['Venus', 'Mars', 'Jupiter', 'Saturn'] },
  { q: 'What is 2 + 2?', a: '4', opts: ['3', '4', '5', '22'] },
  { q: 'Who wrote "Romeo and Juliet"?', a: 'William Shakespeare', opts: ['Charles Dickens', 'William Shakespeare', 'Mark Twain', 'Jane Austen'] },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trivia')
    .setDescription('Answer a trivia question'),
  async execute(interaction) {
    const q = questions[Math.floor(Math.random() * questions.length)];
    const shuffled = q.opts.sort(() => Math.random() - 0.5);

    const row = new ActionRowBuilder().addComponents(
      shuffled.map(opt => new ButtonBuilder()
        .setCustomId(`trivia_${opt}`)
        .setLabel(opt)
        .setStyle(ButtonStyle.Primary))
    );

    const embed = embeds.info('Trivia Time!', q.q);
    const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

    const filter = i => i.customId.startsWith('trivia_');
    const collector = msg.createMessageComponentCollector({ filter, time: 15000 });

    collector.on('collect', async i => {
      const answer = i.customId.replace('trivia_', '');
      if (answer === q.a) {
        await i.update({ embeds: [embeds.success('Correct!', `${i.user} got it right!`)], components: [] });
      } else {
        await i.update({ embeds: [embeds.error('Wrong!', `The correct answer was **${q.a}**`)], components: [] });
      }
      collector.stop();
    });

    collector.on('end', collected => {
      if (!collected.size) {
        interaction.editReply({ embeds: [embeds.warning('Time Up!', `The correct answer was **${q.a}**`)], components: [] });
      }
    });
  },
};
