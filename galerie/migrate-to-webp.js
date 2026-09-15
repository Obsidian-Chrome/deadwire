const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

const IMAGES_DIR = path.join(__dirname, 'images');
const GALLERY_JSON = path.join(__dirname, 'gallery.json');

// Convertit une date ISO en format DDMMYYYY
function formatDateFolder(isoDate) {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}${month}${year}`;
}

// Extrait l'extension du fichier
function getExtension(filename) {
  return path.extname(filename).toLowerCase();
}

// Convertit une image en WebP
async function convertToWebP(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .webp({ quality: 85 }) // Qualité 85% = bon compromis
      .toFile(outputPath);
    return true;
  } catch (error) {
    console.error(`❌ Erreur conversion ${inputPath}:`, error.message);
    return false;
  }
}

async function main() {
  try {
    console.log('🔄 Migration vers WebP avec organisation par date...\n');
    
    // Charger gallery.json
    const galleryData = JSON.parse(await fs.readFile(GALLERY_JSON, 'utf-8'));
    console.log(`📊 ${galleryData.media.length} médias à traiter\n`);
    
    let converted = 0;
    let moved = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const media of galleryData.media) {
      const dateFolder = formatDateFolder(media.timestamp);
      const ext = getExtension(media.filename || '.png');
      const originalFilename = `${media.id}${ext}`;
      const webpFilename = `${media.id}.webp`;
      
      // Chemins source (images actuelles)
      const currentPath = path.join(IMAGES_DIR, originalFilename);
      
      // Nouveaux chemins
      const webpFolder = path.join(IMAGES_DIR, dateFolder);
      const oldFolder = path.join(IMAGES_DIR, 'old', dateFolder);
      const webpPath = path.join(webpFolder, webpFilename);
      const oldPath = path.join(oldFolder, originalFilename);
      
      // Vérifier si le fichier source existe
      try {
        await fs.access(currentPath);
      } catch {
        console.log(`⏭️  Fichier manquant: ${originalFilename}`);
        skipped++;
        continue;
      }
      
      // Créer les dossiers si nécessaire
      await fs.mkdir(webpFolder, { recursive: true });
      await fs.mkdir(oldFolder, { recursive: true });
      
      // Vérifier si déjà converti
      try {
        await fs.access(webpPath);
        console.log(`✅ Déjà converti: ${dateFolder}/${webpFilename}`);
        skipped++;
        
        // Déplacer l'original vers old/ s'il n'y est pas déjà
        try {
          await fs.access(oldPath);
        } catch {
          await fs.rename(currentPath, oldPath);
          console.log(`   📦 Original déplacé vers old/${dateFolder}/`);
        }
        
        continue;
      } catch {
        // Pas encore converti, on continue
      }
      
      // Convertir en WebP
      console.log(`🔄 Conversion: ${originalFilename} → ${dateFolder}/${webpFilename}`);
      const success = await convertToWebP(currentPath, webpPath);
      
      if (success) {
        converted++;
        
        // Déplacer l'original vers old/
        await fs.rename(currentPath, oldPath);
        moved++;
        
        console.log(`✅ Converti et organisé: ${dateFolder}/${webpFilename}`);
        
        // Mettre à jour les URLs dans l'objet media
        media.localWebp = `/galerie/images/${dateFolder}/${webpFilename}`;
        media.localOriginal = `/galerie/images/old/${dateFolder}/${originalFilename}`;
        delete media.localUrl; // Supprimer l'ancienne propriété
      } else {
        errors++;
      }
      
      // Pause pour éviter de surcharger le CPU
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Sauvegarder le gallery.json mis à jour
    await fs.writeFile(
      GALLERY_JSON,
      JSON.stringify(galleryData, null, 2)
    );
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Migration terminée !');
    console.log('='.repeat(60));
    console.log(`🔄 Convertis en WebP: ${converted}`);
    console.log(`📦 Originaux déplacés: ${moved}`);
    console.log(`⏭️  Déjà traités: ${skipped}`);
    console.log(`❌ Erreurs: ${errors}`);
    console.log(`📁 Structure: images/DDMMYYYY/ (WebP) + images/old/DDMMYYYY/ (originaux)`);
    console.log(`📝 gallery.json mis à jour avec les nouveaux chemins`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

main();
