const { SlashCommandBuilder } = require('discord.js');
const OpenAI = require('openai');
const config = require('../../../config');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');

const contexts = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('chat')
    .setDescription('Chat with AI')
    .addStringOption(o => o.setName('message').setDescription('Your message').setRequired(true)),
  cooldown: 5,
  async execute(interaction) {
    if (!config.openrouterKey) {
      return interaction.reply({ embeds: [embeds.error('Not Configured', 'AI key is not set. Ask the bot owner.')], ephemeral: true });
    }

    await interaction.deferReply();

    const openai = new OpenAI({
      apiKey: config.openrouterKey,
      baseURL: 'https://openrouter.ai/api/v1',
    });
    const userId = interaction.user.id;
    const msg = interaction.options.getString('message');

    if (!contexts.has(userId)) {
      contexts.set(userId, [{ role: 'system', content: 'You are a helpful Discord bot assistant named a2bot, created by Ayushrajdev Anzariqbal.' }]);
    }
    const context = contexts.get(userId);
    context.push({ role: 'user', content: msg });

    try {
      const response = await openai.chat.completions.create({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: context.slice(-10),
        max_tokens: 500,
      });

      const reply = response.choices[0].message.content;
      context.push({ role: 'assistant', content: reply });
      contexts.set(userId, context);

      if (reply.length > 2000) {
        await interaction.editReply({ embeds: [embeds.info('AI Response', reply.slice(0, 2000))] });
        await interaction.followUp(reply.slice(2000));
      } else {
        await interaction.editReply({ embeds: [embeds.info('AI Response', reply)] });
      }
    } catch (err) {
      logger.error('OpenRouter error:', err);
      await interaction.editReply({ embeds: [embeds.error('Error', 'Failed to get AI response. The free key may be rate-limited. Try again later.')] });
    }
  },
};
