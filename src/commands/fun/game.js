const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Play Rock-Paper-Scissors'),
  async execute(interaction) {
    const row = new ActionRowBuilder().addComponents(
      ['Rock', 'Paper', 'Scissors'].map(choice =>
        new ButtonBuilder()
          .setCustomId(`rps_${choice.toLowerCase()}`)
          .setLabel(choice)
          .setStyle(ButtonStyle.Secondary))
    );

    const msg = await interaction.reply({ embeds: [embeds.info('Rock Paper Scissors', 'Choose your move!')], components: [row], fetchReply: true });

    const filter = i => i.customId.startsWith('rps_') && i.user.id === interaction.user.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 15000, max: 1 });

    collector.on('collect', async i => {
      const choices = ['rock', 'paper', 'scissors'];
      const botChoice = choices[Math.floor(Math.random() * 3)];
      const userChoice = i.customId.replace('rps_', '');

      let result;
      if (userChoice === botChoice) result = "It's a tie!";
      else if (
        (userChoice === 'rock' && botChoice === 'scissors') ||
        (userChoice === 'paper' && botChoice === 'rock') ||
        (userChoice === 'scissors' && botChoice === 'paper')
      ) result = 'You win!';
      else result = 'You lose!';

      const desc = `You chose **${userChoice}**\nBot chose **${botChoice}**\n\n**${result}**`;
      await i.update({ embeds: [embeds.info('Result', desc)], components: [] });
    });

    collector.on('end', collected => {
      if (!collected.size) {
        interaction.editReply({ embeds: [embeds.warning('Time Up', 'You took too long!')], components: [] });
      }
    });
  },
};
