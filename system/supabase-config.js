// =====================================================
// SUPABASE CONFIGURATION
// =====================================================
// Remplacer ces valeurs après avoir créé le projet Supabase

const SUPABASE_CONFIG = {
  url: 'https://wjjktkglbkfdhvwkyemv.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indqamt0a2dsYmtmZGh2d2t5ZW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0NDIwODMsImV4cCI6MjA5NDAxODA4M30.bCigRZFxkCT0k4_sy3BA_jTX9n4xKZ8kCGc7QhTZNWo'
};

// Initialisation du client Supabase
// Le client sera chargé via CDN dans index.html
let supabaseClient = null;

function initSupabase() {
  if (typeof window.supabase === 'undefined') {
    console.error('Supabase client not loaded. Make sure to include the Supabase CDN script.');
    return false;
  }
  
  supabaseClient = window.supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey
  );
  
  window.supabaseClient = supabaseClient;
  
  console.log('Supabase initialized');
  return true;
}

// =====================================================
// API DE GESTION DES PERSONNAGES
// =====================================================

const CharacterAPI = {
  
  // Récupérer tous les personnages d'un utilisateur
  async getMyCharacters(discordUserId) {
    try {
      const { data, error } = await supabaseClient
        .from('characters')
        .select('*')
        .eq('discord_user_id', discordUserId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching characters:', error);
      throw error;
    }
  },

  // Récupérer tous les personnages (pour MJ)
  async getAllCharacters() {
    try {
      const { data, error } = await supabaseClient
        .from('characters')
        .select('*')
        .order('player_name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all characters:', error);
      throw error;
    }
  },

  // Créer un nouveau personnage
  async createCharacter(characterData) {
    try {
      const { data, error } = await supabaseClient
        .from('characters')
        .insert([characterData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating character:', error);
      throw error;
    }
  },

  // Mettre à jour un personnage
  async updateCharacter(characterId, updates) {
    try {
      const { data, error } = await supabaseClient
        .from('characters')
        .update(updates)
        .eq('id', characterId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating character:', error);
      throw error;
    }
  },

  // Supprimer un personnage
  async deleteCharacter(characterId) {
    try {
      const { error } = await supabaseClient
        .from('characters')
        .delete()
        .eq('id', characterId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting character:', error);
      throw error;
    }
  },

  // Récupérer un personnage par ID
  async getCharacterById(characterId) {
    try {
      const { data, error } = await supabaseClient
        .from('characters')
        .select('*')
        .eq('id', characterId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching character:', error);
      throw error;
    }
  },

  // Sauvegarder toutes les données JSON d'un personnage
  async saveCharacterData(characterId, jsonData) {
    try {
      const { data, error } = await supabaseClient
        .from('characters')
        .update({ data: jsonData })
        .eq('id', characterId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving character data:', error);
      throw error;
    }
  }
};

// Exporter pour utilisation globale
window.CharacterAPI = CharacterAPI;
window.initSupabase = initSupabase;
