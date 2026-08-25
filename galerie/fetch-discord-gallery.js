const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

async function fetchChannelMessages(channelId, limit = 100) {
  const messages = [];
  let lastMessageId = null;
  
  console.log(`Fetching messages from channel: ${channelId}`);
  
  // Récupérer les messages par batch de 100 (limite Discord)
  while (messages.length < limit) {
    const url = `https://discord.com/api/v10/channels/${channelId}/messages?limit=100${lastMessageId ? `&before=${lastMessageId}` : ''}`;
    
    console.log(`Requesting: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Discord API error: ${response.status} - ${errorText}`);
      throw new Error(`Discord API error: ${response.status} - ${errorText}`);
    }

    const batch = await response.json();
    console.log(`Received ${batch.length} messages in this batch`);
    
    if (batch.length === 0) break;
    
    messages.push(...batch);
    lastMessageId = batch[batch.length - 1].id;
    
    // Pause pour éviter le rate limit
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`Total messages fetched: ${messages.length}`);
  return messages.slice(0, limit);
}

async function extractMediaFromMessages(messages) {
  const media = [];
  
  console.log(`Processing ${messages.length} messages for media extraction...`);
  
  for (const message of messages) {
    // Extraire les pièces jointes (images, vidéos, GIFs)
    // Discord renvoie attachments comme un objet, pas un tableau
    const attachments = message.attachments ? Object.values(message.attachments) : [];
    
    if (attachments.length > 0) {
      console.log(`Message ${message.id} has ${attachments.length} attachments`);
      for (const attachment of attachments) {
        const contentType = attachment.content_type || '';
        console.log(`  Attachment: ${attachment.filename}, type: ${contentType}`);
        
        // Filtrer images, vidéos et GIFs
        if (contentType.startsWith('image/') || contentType.startsWith('video/')) {
          media.push({
            id: attachment.id,
            url: attachment.url,
            proxyUrl: attachment.proxy_url,
            filename: attachment.filename,
            width: attachment.width,
            height: attachment.height,
            size: attachment.size,
            type: contentType.startsWith('video/') ? 'video' : 'image',
            timestamp: message.timestamp,
            messageId: message.id,
            author: {
              id: message.author.id,
              username: message.author.username,
              avatar: message.author.avatar
            }
          });
        }
      }
    }
    
    // Extraire les embeds avec images/vidéos
    const embeds = message.embeds ? (Array.isArray(message.embeds) ? message.embeds : Object.values(message.embeds)) : [];
    
    if (embeds.length > 0) {
      for (const embed of embeds) {
        if (embed.type === 'image' && embed.thumbnail) {
          media.push({
            id: `embed_${message.id}_${embed.thumbnail.url}`,
            url: embed.thumbnail.url,
            proxyUrl: embed.thumbnail.proxy_url,
            width: embed.thumbnail.width,
            height: embed.thumbnail.height,
            type: 'image',
            timestamp: message.timestamp,
            messageId: message.id,
            author: {
              id: message.author.id,
              username: message.author.username,
              avatar: message.author.avatar
            }
          });
        }
        
        if (embed.type === 'video' && embed.video) {
          media.push({
            id: `embed_video_${message.id}`,
            url: embed.video.url,
            proxyUrl: embed.video.proxy_url,
            width: embed.video.width,
            height: embed.video.height,
            type: 'video',
            timestamp: message.timestamp,
            messageId: message.id,
            author: {
              id: message.author.id,
              username: message.author.username,
              avatar: message.author.avatar
            }
          });
        }
      }
    }
  }
  
  return media;
}

async function main() {
  try {
    console.log('🔍 Récupération des messages du canal Discord...');
    
    // Récupérer les 500 derniers messages (ajustable)
    const messages = await fetchChannelMessages(DISCORD_CHANNEL_ID, 500);
    console.log(`✅ ${messages.length} messages récupérés`);
    
    // Extraire les médias
    const media = await extractMediaFromMessages(messages);
    console.log(`${media.length} médias extraits`);
    
    // Trier par date (plus récents en premier)
    media.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Sauvegarder dans gallery.json
    const output = {
      media: media,
      lastUpdated: new Date().toISOString(),
      totalCount: media.length
    };
    
    const outputPath = path.join(__dirname, 'gallery.json');
    await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
    
    console.log(`Galerie sauvegardée dans ${outputPath}`);
    console.log(`Total: ${media.length} médias`);
    
  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  }
}

main();
