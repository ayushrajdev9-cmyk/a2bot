const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior } = require('@discordjs/voice');
const playdl = require('play-dl');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');

const queues = new Map();

function getQueue(guildId) {
  if (!queues.has(guildId)) queues.set(guildId, { player: null, tracks: [], connection: null });
  return queues.get(guildId);
}

async function playTrack(guildId) {
  const queue = getQueue(guildId);
  if (!queue.tracks.length) return;

  const track = queue.tracks[0];
  try {
    const stream = await playdl.stream(track.url);
    const resource = createAudioResource(stream.stream, { inputType: stream.type });
    queue.player.play(resource);
  } catch (err) {
    logger.error('Playback error:', err);
    queue.tracks.shift();
    playTrack(guildId);
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song from YouTube')
    .addStringOption(o => o.setName('query').setDescription('Song name or URL').setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply();

    const query = interaction.options.getString('query');
    const channel = interaction.member.voice.channel;
    if (!channel) {
      return interaction.editReply({ embeds: [embeds.error('Error', 'You must be in a voice channel.')] });
    }

    let track;
    if (query.match(/^https?:\/\//)) {
      track = { url: query, title: query };
    } else {
      const results = await playdl.search(query, { limit: 1 });
      if (!results.length) {
        return interaction.editReply({ embeds: [embeds.error('Error', 'No results found.')] });
      }
      track = { url: results[0].url, title: results[0].title };
    }

    const queue = getQueue(interaction.guild.id);

    if (!queue.connection) {
      queue.connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });
      queue.player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });

      queue.connection.subscribe(queue.player);
      queue.player.on(AudioPlayerStatus.Idle, () => {
        queue.tracks.shift();
        playTrack(interaction.guild.id);
      });
    }

    queue.tracks.push(track);

    if (queue.tracks.length === 1) {
      playTrack(interaction.guild.id);
    }

    await interaction.editReply({ embeds: [embeds.success('Added to Queue', `**[${track.title}](${track.url})**\nPosition: ${queue.tracks.length}`)] });
  },
  getQueue,
};
