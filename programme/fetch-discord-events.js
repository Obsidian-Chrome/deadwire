/**
 * Script pour récupérer les événements Discord planifiés
 * 
 * Utilisation :
 * 1. Installer les dépendances : npm install node-fetch
 * 2. Créer un fichier .env avec :
 *    DISCORD_BOT_TOKEN=ton_bot_token
 *    DISCORD_GUILD_ID=ton_guild_id
 * 3. Exécuter : node fetch-discord-events.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || 'YOUR_GUILD_ID_HERE';
const OUTPUT_FILE = path.join(__dirname, 'events.json');

/**
 * Récupère les événements planifiés du serveur Discord
 */
async function fetchDiscordEvents() {
  const url = `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/scheduled-events`;
  
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur API Discord: ${response.status} ${response.statusText}`);
    }

    const events = await response.json();
    return events;
  } catch (error) {
    console.error('Erreur lors de la récupération des événements Discord:', error);
    throw error;
  }
}

/**
 * Transforme les événements Discord en format utilisable par le frontend
 */
function transformEvents(discordEvents) {
  return discordEvents
    .filter(event => event.status !== 3 && event.status !== 4) // Exclut les événements terminés (3 = COMPLETED) et annulés (4 = CANCELED)
    .map(event => {
      const startDate = new Date(event.scheduled_start_time);
      const endDate = event.scheduled_end_time ? new Date(event.scheduled_end_time) : null;
      
      return {
        id: event.id,
        name: event.name,
        description: event.description || '',
        location: event.entity_metadata?.location || 'Non spécifié',
        coverUrl: event.image ? `https://cdn.discordapp.com/guild-events/${event.id}/${event.image}.png?size=1024` : null,
        startTime: startDate.toISOString(),
        endTime: endDate ? endDate.toISOString() : null,
        status: event.status, // 1 = SCHEDULED, 2 = ACTIVE, 3 = COMPLETED, 4 = CANCELED
        entityType: event.entity_type, // 1 = STAGE_INSTANCE, 2 = VOICE, 3 = EXTERNAL
        creatorId: event.creator_id,
        channelId: event.channel_id,
        interestedCount: event.user_count || 0
      };
    })
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime)); // Trie par date
}

/**
 * Sauvegarde les événements dans un fichier JSON
 */
function saveEvents(events) {
  const data = {
    lastUpdate: new Date().toISOString(),
    events: events
  };
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ ${events.length} événement(s) sauvegardé(s) dans ${OUTPUT_FILE}`);
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🔄 Récupération des événements Discord...');
  
  if (DISCORD_BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE' || DISCORD_GUILD_ID === 'YOUR_GUILD_ID_HERE') {
    console.error('❌ Erreur: Veuillez configurer DISCORD_BOT_TOKEN et DISCORD_GUILD_ID');
    console.log('\nCréez un fichier .env avec :');
    console.log('DISCORD_BOT_TOKEN=votre_bot_token');
    console.log('DISCORD_GUILD_ID=votre_guild_id');
    process.exit(1);
  }
  
  try {
    const discordEvents = await fetchDiscordEvents();
    console.log(`📅 ${discordEvents.length} événement(s) trouvé(s) sur Discord`);
    
    const transformedEvents = transformEvents(discordEvents);
    saveEvents(transformedEvents);
    
    console.log('✨ Terminé !');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Exécution
main();
