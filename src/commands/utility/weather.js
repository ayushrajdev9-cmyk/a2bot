const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

const weatherCodes = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
  55: 'Dense drizzle', 56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
  61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain', 66: 'Light freezing rain',
  67: 'Heavy freezing rain', 71: 'Slight snowfall', 73: 'Moderate snowfall',
  75: 'Heavy snowfall', 77: 'Snow grains', 80: 'Slight rain showers',
  81: 'Moderate rain showers', 82: 'Violent rain showers', 85: 'Slight snow showers',
  86: 'Heavy snow showers', 95: 'Thunderstorm', 96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('weather')
    .setDescription('Get current weather for a city')
    .addStringOption(o => o.setName('city').setDescription('City name').setRequired(true)),
  async execute(interaction) {
    const city = interaction.options.getString('city');
    await interaction.deferReply();

    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
      if (!geoRes.ok) throw new Error('Geocoding failed');
      const geoData = await geoRes.json();
      if (!geoData.results?.length) {
        return interaction.editReply({ embeds: [embeds.error('Not Found', `City "${city}" not found.`)] });
      }

      const { latitude, longitude, name, country } = geoData.results[0];
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
      const weatherData = await weatherRes.json();
      if (!weatherData.current_weather) throw new Error('No weather data');
      const w = weatherData.current_weather;

      const desc = weatherCodes[w.weathercode] || 'Unknown';
      const embed = embeds.info(`Weather in ${name}${country ? `, ${country}` : ''}`)
        .addFields(
          { name: 'Temperature', value: `${w.temperature}°C`, inline: true },
          { name: 'Windspeed', value: `${w.windspeed} km/h`, inline: true },
          { name: 'Condition', value: desc, inline: true },
        );

      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply({ embeds: [embeds.error('API Error', 'Failed to fetch weather data.')] });
    }
  },
};
