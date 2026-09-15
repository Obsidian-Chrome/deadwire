const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const PRODUCTION_MODE = process.env.PRODUCTION_MODE === 'true'; // Mode GitHub Actions

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
  
  // Compter les messages avec attachments
  let messagesWithAttachments = 0;
  
  for (const message of messages) {
    // Extraire les pièces jointes (images, vidéos, GIFs)
    // Vérifier si attachments est un tableau ou un objet
    let attachments = [];
    
    if (message.attachments) {
      if (Array.isArray(message.attachments)) {
        attachments = message.attachments;
      } else if (typeof message.attachments === 'object') {
        attachments = Object.values(message.attachments);
      }
    }
    
    if (attachments.length > 0) {
      messagesWithAttachments++;
      console.log(`Message ${message.id} has ${attachments.length} attachments`);
      console.log('Attachments:', JSON.stringify(attachments, null, 2));
      
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
  
  console.log(`Messages with attachments: ${messagesWithAttachments}`);
  console.log(`Total media extracted: ${media.length}`);
  
  return media;
}

const sharp = require('sharp');

// Convertit une date ISO en format DDMMYYYY
function formatDateFolder(isoDate) {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}${month}${year}`;
}

// Télécharge une image et la sauvegarde localement
async function downloadImage(url, filepath) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    await fs.writeFile(filepath, Buffer.from(buffer));
    return true;
  } catch (error) {
    console.error(`❌ Erreur téléchargement ${filepath}:`, error.message);
    return false;
  }
}

// Convertit une image en WebP
async function convertToWebP(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(outputPath);
    return true;
  } catch (error) {
    console.error(`❌ Erreur conversion WebP ${outputPath}:`, error.message);
    return false;
  }
}

// Extrait l'extension depuis le filename
function getExtension(media) {
  if (media.filename) {
    const ext = path.extname(media.filename);
    if (ext) return ext;
  }
  return media.type === 'video' ? '.mp4' : '.png';
}

async function main() {
  try {
    console.log('🔍 Récupération des messages du canal Discord...');
    
    // Créer le dossier images s'il n'existe pas
    const imagesDir = path.join(__dirname, 'images');
    await fs.mkdir(imagesDir, { recursive: true });
    
    // Charger l'ancien gallery.json s'il existe
    const outputPath = path.join(__dirname, 'gallery.json');
    let existingMedia = [];
    let existingMediaIds = new Set();
    
    try {
      const existingData = JSON.parse(await fs.readFile(outputPath, 'utf-8'));
      existingMedia = existingData.media || [];
      existingMediaIds = new Set(existingMedia.map(m => m.id));
      console.log(`📂 ${existingMedia.length} médias existants dans gallery.json`);
    } catch {
      console.log('📂 Aucun gallery.json existant, création d\'un nouveau');
    }
    
    // Récupérer les 500 derniers messages (ajustable)
    const messages = await fetchChannelMessages(DISCORD_CHANNEL_ID, 500);
    console.log(`✅ ${messages.length} messages récupérés`);
    
    // Extraire les médias
    const newMedia = await extractMediaFromMessages(messages);
    console.log(`📊 ${newMedia.length} médias extraits de Discord`);
    
    // Filtrer uniquement les nouveaux médias
    const mediaToAdd = newMedia.filter(m => !existingMediaIds.has(m.id));
    console.log(`🆕 ${mediaToAdd.length} nouveaux médias à ajouter`);
    
    // Télécharger et convertir les nouvelles images
    let downloadedCount = 0;
    let convertedCount = 0;
    
    for (const media of mediaToAdd) {
      const dateFolder = formatDateFolder(media.timestamp);
      const ext = getExtension(media);
      const originalFilename = `${media.id}${ext}`;
      const webpFilename = `${media.id}.webp`;
      
      // Créer les dossiers pour cette date
      const webpFolder = path.join(imagesDir, dateFolder);
      await fs.mkdir(webpFolder, { recursive: true });
      
      const webpPath = path.join(webpFolder, webpFilename);
      
      // En mode production, pas de dossier old/
      let oldFolder = null;
      let originalPath = null;
      
      if (!PRODUCTION_MODE) {
        oldFolder = path.join(imagesDir, 'old', dateFolder);
        await fs.mkdir(oldFolder, { recursive: true });
        originalPath = path.join(oldFolder, originalFilename);
      }
      
      // Vérifier si déjà converti
      try {
        await fs.access(webpPath);
        console.log(`⏭️  Déjà présent: ${dateFolder}/${webpFilename}`);
        
        // Mettre à jour les URLs
        media.localWebp = `/galerie/images/${dateFolder}/${webpFilename}`;
        if (!PRODUCTION_MODE) {
          media.localOriginal = `/galerie/images/old/${dateFolder}/${originalFilename}`;
        }
        continue;
      } catch {
        // Pas encore converti
      }
      
      // Télécharger l'image originale dans un fichier temporaire
      const tempPath = path.join(imagesDir, `temp_${media.id}${ext}`);
      console.log(`⬇️  Téléchargement: ${originalFilename}`);
      const downloadSuccess = await downloadImage(media.url, tempPath);
      
      if (downloadSuccess) {
        downloadedCount++;
        console.log(`✅ Téléchargé: ${originalFilename}`);
        
        // Convertir en WebP
        console.log(`🔄 Conversion en WebP: ${dateFolder}/${webpFilename}`);
        const convertSuccess = await convertToWebP(tempPath, webpPath);
        
        if (convertSuccess) {
          convertedCount++;
          console.log(`✅ Converti: ${dateFolder}/${webpFilename}`);
          
          // Mettre à jour les URLs
          media.localWebp = `/galerie/images/${dateFolder}/${webpFilename}`;
          
          if (PRODUCTION_MODE) {
            // Mode production : supprimer l'original
            await fs.unlink(tempPath);
            console.log(`�️  Original supprimé (mode production)`);
          } else {
            // Mode local : sauvegarder l'original
            await fs.rename(tempPath, originalPath);
            console.log(`📦 Original sauvegardé: old/${dateFolder}/${originalFilename}`);
            media.localOriginal = `/galerie/images/old/${dateFolder}/${originalFilename}`;
          }
        } else {
          // Échec de conversion
          if (PRODUCTION_MODE) {
            // Mode production : supprimer le fichier temporaire
            await fs.unlink(tempPath);
            console.log(`❌ Conversion échouée, fichier temporaire supprimé`);
          } else {
            // Mode local : garder l'original quand même
            await fs.rename(tempPath, originalPath);
            media.localOriginal = `/galerie/images/old/${dateFolder}/${originalFilename}`;
          }
        }
      }
      
      // Pause pour éviter le rate limit
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Fusionner les médias (nouveaux + existants)
    const allMedia = [...mediaToAdd, ...existingMedia];
    
    // Trier par date (plus récents en premier)
    allMedia.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Sauvegarder dans gallery.json
    const output = {
      media: allMedia,
      lastUpdated: new Date().toISOString(),
      totalCount: allMedia.length
    };
    
    await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
    
    console.log('\n' + '='.repeat(60));
    console.log(`✅ Galerie mise à jour: ${outputPath}`);
    console.log(`📊 Total: ${allMedia.length} médias`);
    console.log(`🆕 Nouveaux: ${mediaToAdd.length}`);
    console.log(`💾 Images téléchargées: ${downloadedCount}`);
    console.log(`🔄 Converties en WebP: ${convertedCount}`);
    console.log(`📁 Structure: images/DDMMYYYY/ (WebP) + images/old/DDMMYYYY/ (originaux)`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  }
}

main();
